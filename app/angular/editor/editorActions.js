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
        _.bindAll(this, "initCommands", "storeCommands"); 
        this.graph = configs.graph;
        this.undoStack = [];
        this.redoStack = [];
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
                runningCommand.data.attributes = _.merge({}, cellView.toJSON());
                runningCommand.options = d || {};
                runningCommand.data.view = cellView;                
                this.saveCommand(runningCommand);
                return runningCommand;
            }
            if(!(runningCommand.batch && runningCommand.action)) {
                runningCommand.action = commandAction;
                runningCommand.data.id = cellView.id; 
                runningCommand.data.type = cellView.attributes.type; 
                runningCommand.data.previous[commandDescription] = _.clone(cellView.previous(commandDescription));
                runningCommand.options = d || {};
            } 
            runningCommand.data.next[commandDescription] = _.clone(cellView.get(commandDescription));
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
                        if (command.action.startsWith("change") && _.isEqual(command.data.previous, command.data.next)) {
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
        const commandEventArr = _.isArray(commandEvent) ? commandEvent : [commandEvent];
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
        const commandEventArr = _.isArray(commandEvent) ? commandEvent : [commandEvent];
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