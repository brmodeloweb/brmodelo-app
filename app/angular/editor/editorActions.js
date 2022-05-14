import * as joint from "jointjs/dist/joint";

joint.dia.EditorActions = Backbone.Model.extend({
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
        _.bindAll(this, "initBatchCommand", "storeBatchCommand"); 
        this.graph = configs.graph;
        this.undoStack = [];
        this.redoStack = [];
        this.listen();
    },
    listen: function () {
        this.listenTo(this.graph, "all", this.addCommand, this);
        this.listenTo(this.graph, "batch:start", this.initBatchCommand, this); 
        this.listenTo(this.graph, "batch:stop", this.storeBatchCommand, this);
    },
    createCommand: function (event) {
        return {
            action: null,
            data: {
                id: null,
                type: null,
                previous: {},
                next: {}
            },
            batch: event && event.batch
        };
    },
    push: function (event) {
        this.redoStack = []; 
        if(event.batch) {
            this.lastCmdIndex = Math.max(this.lastCmdIndex, 0); 
            this.trigger("batch", event);
        } else {
            this.undoStack.push(event); 
            this.trigger(this.actions.ADD, event);
        }
    },
    addCommand: function (a, b, c, d) {
        if (!(d && d.dry || !this.get("cmdNameRegex").test(a) || "function" == typeof this.get("cmdBeforeAdd") && !this.get("cmdBeforeAdd").apply(this, arguments))) {
            var e = void 0;
            if (this.batchCommand) {
                if (e = this.batchCommand[Math.max(this.lastCmdIndex, 0)], this.lastCmdIndex >= 0 && (e.data.id !== b.id || e.action !== a)) {
                    var f = _.findIndex(this.batchCommand, function (c, d) {
                        return c.data.id === b.id && c.action === a
                    }, this);
                    0 > f || this.actions.ADD === a || this.actions.REMOVE === a ? e = this.createCommand({
                        batch: !0
                    }) : (e = this.batchCommand[f], this.batchCommand.splice(f, 1)), this.lastCmdIndex = this.batchCommand.push(e) - 1
                }
            } else e = this.createCommand({
                batch: !1
            });
            if (this.actions.ADD === a || this.actions.REMOVE === a) {
                e.action = a;
                e.data.id = b.id;
                e.data.type = b.attributes.type;
                e.data.attributes = _.merge({}, b.toJSON());
                e.options = d || {};
                e.data.view = b;
                this.push(e);
                return e;
            }
            var g = a.substr(this.PREFIX_LENGTH);
            e.batch && e.action || (e.action = a, e.data.id = b.id, e.data.type = b.attributes.type, e.data.previous[g] = _.clone(b.previous(g)), e.options = d || {}), e.data.next[g] = _.clone(b.get(g)), this.push(e)
        }
    },
    initBatchCommand: function () {
        if(this.batchCommand) {
            this.batchLevel++;
        } else {
            const newCommand = this.createCommand({
                batch: true
            });
            this.batchCommand = [newCommand]; 
            this.lastCmdIndex = -1; 
            this.batchLevel = 0;
        }
    },
    storeBatchCommand: function () {
        if (this.batchCommand && this.batchLevel <= 0) {
            const batchCommand = this.filterBatchCommand(this.batchCommand);
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
    filterBatchCommand: function (commandEvent) {
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
    revertCommand: function (commandEvent) {
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
                    cellView.set(action, command.data.previous[action], commandId)
            }
        }); 
        this.listen();
    },
    applyCommand: function (commandEvent) {
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
            this.revertCommand(redoAction);
            this.redoStack.push(redoAction);
        }
    },
    redo: function () {
        const redoAction = this.redoStack.pop();
        if(redoAction) {
            this.applyCommand(redoAction); 
            this.undoStack.push(redoAction);
        }
    },
});