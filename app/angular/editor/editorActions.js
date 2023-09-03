import * as joint from "jointjs/dist/joint";

joint.ui.EditorActions = Backbone.Model.extend({
    defaults: {
        cmdBeforeAdd: null,
        cmdNameRegex: /^(?:add|remove|change:\w+)$/
    },
    PREFIX_LENGTH: 7,
    actions: {
        ADD: "add",
        REMOVE: "remove"
    },
    initialize: function (configs) {
		this.initCommands = this.initCommands.bind(this);
		this.storeCommands = this.storeCommands.bind(this);
		this.setCopyContext = this.setCopyContext.bind(this);

        this.graph = configs.graph;
		this.paper = configs.paper;
        this.undoStack = [];
        this.redoStack = [];
		this.copyContext = {
			"element": null,
			"event": null
		}
        this.listen();
    },
    listen: function () {
        this.listenTo(this.graph, "all", this.listenCommand, this);
        this.listenTo(this.graph, "batch:start", this.initCommands, this);
        this.listenTo(this.graph, "batch:stop", this.storeCommands, this);
    },
    newCommand: function (param) {
        return {
            action: param.action,
            data: param.data || {
                id: null,
                type: null,
                previous: {},
                next: {}
            },
            batch: param && param.batch,
            options: param.options
        };
    },
    saveCommand: function (event) {
        this.redoStack = [];
        if(event.batch) {
            this.lastCmdIndex = Math.max(this.lastCmdIndex, 0);
            this.trigger("batch", event);
        } else {
            this.undoStack.push(event);
            this.trigger(this.actions.ADD, event);
        }
    },
    listenCommand: function (commandAction, cellView, c, d) {
        const commandDescription = commandAction.substr(this.PREFIX_LENGTH);
        if (!(d && d.dry || !this.get("cmdNameRegex").test(commandAction) || "function" == typeof this.get("cmdBeforeAdd") && !this.get("cmdBeforeAdd").apply(this, arguments))) {
            let runningCommand = null;
            if (this.batchCommand) {
                runningCommand = this.batchCommand[Math.max(this.lastCmdIndex, 0)];
                if (this.lastCmdIndex >= 0 && (runningCommand.data.id !== cellView.id || runningCommand.action !== commandAction)) {
                    const currentCommandIndex = this.batchCommand.findIndex(element => {
                        return element.data.id === cellView.id && element.action === commandAction;
                    });
                    if(currentCommandIndex < 0 || this.actions.ADD === commandAction || this.actions.REMOVE === commandAction) {
                        runningCommand = this.newCommand({
                            batch: true
                        });
                    } else {
                        runningCommand = this.batchCommand[currentCommandIndex];
                        this.batchCommand.splice(currentCommandIndex, 1);
                    }
                    this.lastCmdIndex = this.batchCommand.push(runningCommand) - 1;
                }
            } else runningCommand = this.newCommand({
                batch: false
            });
            if (this.actions.ADD === commandAction || this.actions.REMOVE === commandAction) {
                runningCommand.action = commandAction;
                runningCommand.data.id = cellView.id;
                runningCommand.data.type = cellView.attributes.type;
                runningCommand.data.attributes = { ...cellView.toJSON() };
                runningCommand.options = d || {};
                runningCommand.data.view = cellView;
                this.saveCommand(runningCommand);
                return runningCommand;
            }
            if(!(runningCommand.batch && runningCommand.action)) {
                runningCommand.action = commandAction;
                runningCommand.data.id = cellView.id;
                runningCommand.data.type = cellView.attributes.type;
                runningCommand.data.previous[commandDescription] = Object.assign({}, cellView.previous(commandDescription));
                runningCommand.options = d || {};
            }
            runningCommand.data.next[commandDescription] = Object.assign({}, cellView.get(commandDescription));
            this.saveCommand(runningCommand);
        }
    },
    initCommands: function () {
        if(this.batchCommand) {
            this.batchLevel++;
        } else {
            const newCommand = this.newCommand({
                action: null,
                batch: true
            });
            this.batchCommand = [newCommand];
            this.lastCmdIndex = -1;
            this.batchLevel = 0;
        }
    },
    storeCommands: function () {
        if (this.batchCommand && this.batchLevel <= 0) {
            const batchCommand = this.filterCommands(this.batchCommand);
            if(batchCommand.length > 0) {
                this.redoStack = [];
                this.undoStack.push(batchCommand);
                this.trigger(this.actions.ADD, batchCommand);
            }
            delete this.batchCommand;
            delete this.lastCmdIndex;
            delete this.batchLevel;
        } else if (this.batchCommand && this.batchLevel > 0) {
            this.batchLevel--;
        }
    },
	copyElement: function (element) {
		if(element != null) {
			this.copyContext.element = element.model.clone();
			const oginalPos = element.model.attributes.position
			this.setCopyContext({
				"clientX": oginalPos.x + 25,
				"clientY": oginalPos.y + 25,
				"type": "originalposition"
			})
			console.log(element);
		}
    },
	setCopyContext: function (event) {
		if(this.copyContext.element != null) {
			const normalizedEvent = joint.util.normalizeEvent(event);
			console.log(event);
			let localPoint = { x: normalizedEvent.clientX, y: normalizedEvent.clientY }
			if(event.type === "mousedown") {
				localPoint = this.paper.clientToLocalPoint({ x: normalizedEvent.clientX, y: normalizedEvent.clientY })
			}
			this.copyContext.event = {
				"x": localPoint.x,
				"y": localPoint.y
			}
		}
    },
	pasteElement: function () {
		if(this.copyContext != null && this.copyContext.element != null && this.copyContext.event != null) {
			const toPastElement = this.copyContext.element;
			toPastElement.attributes.position = {
				"x": this.copyContext.event.x,
				"y": this.copyContext.event.y
			}
			this.graph.addCell(toPastElement);
			this.copyContext = {
				"element": null,
				"event": null
			}
		}
    },
    filterCommands: function (commandEvent) {
        const filteredBatch = [];
        for (let batchCommand = commandEvent.slice(); batchCommand.length > 0;) {
            const command = batchCommand.shift();
            const elementId = command.data.id;
            if (command.action != null && elementId != null) {
                switch(command.action) {
                    case this.actions.ADD:
                        const commandAddIndex = batchCommand.findIndex(element => {
                            return element.action === this.actions.REMOVE && element.data.id === elementId;
                        });
                        if (commandAddIndex >= 0) {
                            batchCommand = batchCommand.filter((element, index) => {
                                return !(commandAddIndex >= index && element.data.id === elementId);
                            });
                            continue;
                        }
                        break;
                    case this.actions.REMOVE:
                        const commandRemoveIndex = batchCommand.findIndex(element => {
                            return element.action === this.actions.ADD && element.data.id === elementId;
                        });
                        if (commandRemoveIndex >= 0) {
                            batchCommand.splice(commandRemoveIndex, 1);
                            continue;
                        }
                        break;
                    default:
                        if (command.action.startsWith("change") && command.data.previous === command.data.next) {
                            continue
                        }
                }
                filteredBatch.push(command);
            }
        }
        return filteredBatch;
    },
    undoCommand: function (commandEvent) {
        this.stopListening();
        const commandId = {
            commandManager: this.id || this.cid
        };
        const commandEventArr = Array.isArray(commandEvent) ? commandEvent : [commandEvent];
        commandEventArr.reverse().forEach(command => {
            const cellView = this.graph.getCell(command.data.id);
            switch (command.action) {
                case this.actions.ADD:
                    cellView.remove(commandId);
                    break;
                case this.actions.REMOVE:
                    this.graph.addCell(command.data.view, commandId);
                    break;
                default:
                    const action = command.action.substr(this.PREFIX_LENGTH);
                    cellView.set(action, command.data.previous[action], commandId);
            }
        });
        this.listen();
    },
    redoCommand: function (commandEvent) {
        this.stopListening();
        const commandId = {
            commandManager: this.id || this.cid
        };
        const commandEventArr = Array.isArray(commandEvent) ? commandEvent : [commandEvent];
        commandEventArr.forEach(command => {
            const cellView = this.graph.getCell(command.data.id);
            switch (command.action) {
                case this.actions.ADD:
                    this.graph.addCell(command.data.view, commandId);
                    break;
                case this.actions.REMOVE:
                    cellView.remove(commandId);
                    break;
                default:
                    const action = command.action.substr(this.PREFIX_LENGTH);
                    cellView.set(action, command.data.next[action], commandId);
            }
        });
        this.listen();
    },
    undo: function () {
        const redoAction = this.undoStack.pop();
        if(redoAction) {
            this.undoCommand(redoAction);
            this.redoStack.push(redoAction);
        }
    },
    redo: function () {
        const redoAction = this.redoStack.pop();
        if(redoAction) {
            this.redoCommand(redoAction);
            this.undoStack.push(redoAction);
        }
    },
});