import * as joint from "jointjs";

joint.dia.CommandManager = Backbone.Model.extend({
		defaults: {
				cmdBeforeAdd: null,
				cmdNameRegex: /^(?:add|remove|change:\w+)$/
		},
		PREFIX_LENGTH: 7,
		initialize: function(a) {
				_.bindAll(this, "initBatchCommand", "storeBatchCommand"), this.graph = a.graph, this.reset(), this.listen()
		},
		listen: function() {
				this.listenTo(this.graph, "all", this.addCommand, this), this.listenTo(this.graph, "batch:start", this.initBatchCommand, this), this.listenTo(this.graph, "batch:stop", this.storeBatchCommand, this)
		},
		createCommand: function(a) {
				var b = {
						action: void 0,
						data: {
								id: void 0,
								type: void 0,
								previous: {},
								next: {}
						},
						batch: a && a.batch
				};
				return b
		},
		push: function(a) {
				this.redoStack = [], a.batch ? (this.lastCmdIndex = Math.max(this.lastCmdIndex, 0), this.trigger("batch", a)) : (this.undoStack.push(a), this.trigger("add", a))
		},
		addCommand: function(a, b, c, d) {
				if (!(d && d.dry || !this.get("cmdNameRegex").test(a) || "function" == typeof this.get("cmdBeforeAdd") && !this.get("cmdBeforeAdd").apply(this, arguments))) {
						var e = void 0;
						if (this.batchCommand) {
								if (e = this.batchCommand[Math.max(this.lastCmdIndex, 0)], this.lastCmdIndex >= 0 && (e.data.id !== b.id || e.action !== a)) {
										var f = _.findIndex(this.batchCommand, function(c, d) {
												return c.data.id === b.id && c.action === a
										}, this);
										0 > f || "add" === a || "remove" === a ? e = this.createCommand({
												batch: !0
										}) : (e = this.batchCommand[f], this.batchCommand.splice(f, 1)), this.lastCmdIndex = this.batchCommand.push(e) - 1
								}
						} else e = this.createCommand({
								batch: !1
						});
						if ("add" === a || "remove" === a) {
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
		initBatchCommand: function() {
				this.batchCommand ? this.batchLevel++ : (this.batchCommand = [this.createCommand({
						batch: !0
				})], this.lastCmdIndex = -1, this.batchLevel = 0)
		},
		storeBatchCommand: function() {
				if (this.batchCommand && this.batchLevel <= 0) {
						var a = this.filterBatchCommand(this.batchCommand);
						a.length > 0 && (this.redoStack = [], this.undoStack.push(a), this.trigger("add", a)), delete this.batchCommand, delete this.lastCmdIndex, delete this.batchLevel
				} else this.batchCommand && this.batchLevel > 0 && this.batchLevel--
		},
		filterBatchCommand: function(a) {
				for (var b = a.slice(), c = []; b.length > 0;) {
						var d = b.shift(),
								e = d.data.id;
						if (null != d.action && null != e) {
								if ("add" === d.action) {
										var f = _.findIndex(b, {
												action: "remove",
												data: {
														id: e
												}
										});
										if (f >= 0) {
												b = _.reject(b, function(a, b) {
														return f >= b && a.data.id === e
												});
												continue
										}
								} else if ("remove" === d.action) {
										var g = _.findIndex(b, {
												action: "add",
												data: {
														id: e
												}
										});
										if (g >= 0) {
												b.splice(g, 1);
												continue
										}
								} else if (0 === d.action.indexOf("change") && _.isEqual(d.data.previous, d.data.next)) continue;
								c.push(d)
						}
				}
				return c
		},
		revertCommand: function(a) {
				this.stopListening();
				var b, c = {
						commandManager: this.id || this.cid
				};
				b = _.isArray(a) ? a : [a];
				for (var d = b.length - 1; d >= 0; d--) {
						var e = b[d],
								f = this.graph.getCell(e.data.id);
						switch (e.action) {
								case "add":
										f.remove(c);
										break;
								case "remove":
										this.graph.addCell(e.data.view, c);
										break;
								default:
										var g = e.action.substr(this.PREFIX_LENGTH);
										f.set(g, e.data.previous[g], c)
						}
				}
				this.listen()
		},
		applyCommand: function(a) {
				this.stopListening();
				var b, c = {
						commandManager: this.id || this.cid
				};
				b = _.isArray(a) ? a : [a];
				for (var d = 0; d < b.length; d++) {
						var e = b[d],
								f = this.graph.getCell(e.data.id);
						switch (e.action) {
								case "add":
										this.graph.addCell(e.data.view, c);
										break;
								case "remove":
										f.remove(c);
										break;
								default:
										var g = e.action.substr(this.PREFIX_LENGTH);
										f.set(g, e.data.next[g], c)
						}
				}
				this.listen()
		},
		undo: function() {
				var a = this.undoStack.pop();
				a && (this.revertCommand(a), this.redoStack.push(a))
		},
		redo: function() {
				var a = this.redoStack.pop();
				a && (this.applyCommand(a), this.undoStack.push(a))
		},
		cancel: function() {
				this.hasUndo() && (this.revertCommand(this.undoStack.pop()), this.redoStack = [])
		},
		reset: function() {
				this.undoStack = [], this.redoStack = []
		},
		hasUndo: function() {
				return this.undoStack.length > 0
		},
		hasRedo: function() {
				return this.redoStack.length > 0
		}
});
