import $ from "jquery";
import _ from "underscore";
import "backbone";
import * as joint from "jointjs/dist/joint";

joint.ui.ElementActions = Backbone.View.extend({
    className: "element-action",
    events: {
        "mousedown .item": "onHandlePointerDown",
        "touchstart .item": "onHandlePointerDown",
    },
    options: {
        tinyThreshold: 40,
        smallThreshold: 80,
        loopLinkPreferredSide: "top",
        loopLinkWidth: 40,
        rotateAngleGrid: 15,
        clearAll: !0,
        useModelGeometry: !1,
        handles: [{
            name: "resize",
            position: "se",
            events: {
                pointerdown: "startResizing",
                pointermove: "doResize",
                pointerup: "stopBatch"
            },
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAABMUlEQVRoge3ZwUrDQBRA0YMV9OO60m7c+091KW7Fr7NQUUEXtRDTJpk0SfsmzIVZFDrwDsmQlFIqlUoTdIs3fOJnwLp4j4YBGiFXEw8+227wig+Z31qp3Ws/R1nUhcgCssKX/0PXP4eHHLsS33iQEaQNQSaQLgQZQFIQBIekIggM6YMgKKQvgoCQUxAEgzQ97FYJezeVPe9TDZjSEAQ8VfatpxgwpaEIWGD5txZjD5jSqWciVAURpVCIa7vDeKff4RrjYI/aS2WQ58Q94RCwrQyzTfh+SAT9XglCnYl6qZDQCNIg4RF0Q7JA0A7JBkEzJCsExyHZITiEZIngEBLyYZdSHZLdldg3CwTtV6Rrbex+Y1/kJ2m9IZD9Wp5z4Cn/Q+x62TxLQ2+ttSC3VqlUmlm/31h44m9dArgAAAAASUVORK5CYII="
        }, {
            name: "remove",
            position: "nw",
            events: {
                pointerdown: "removeElement"
            },
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAjklEQVRIie2Vyw2AIBQER3uQaIlarhwsRy+Y4AfCPuTmnEx0dwg+FH4MzIAz5FzIZlmAHfCixIXMHjqSDMAaHtyAqaD8nhnVQE4ilysSc3mJpLo8J/ms/CSeEH+7tozzK/GqpZX3FdKuInuh6Ra9vVDLYSwuT92TJSWjaJYocy5LLIdIkjT/XEPjH87PgwNng1K28QMLlAAAAABJRU5ErkJggg=="
        }, {
            name: "link",
            position: "e",
            events: {
                pointerdown: "startLinking",
                pointermove: "doLink",
                pointerup: "stopLinking"
            },
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAA7klEQVRIie3WMUpDQRAG4I+AWNkJgpWFB7DQ0iqVrTZ6B5NLGA9hpVfIARJsAgl4BkHBSuwkIBFj8RT2LSkE2XkJ5Ictl49dZmeHdZYsQ8x/1gRbUfBDAs/RRysC3sNrhvciYDjGRwJ/4SIK76ifeoqjKPwmw1+wGwFv4D7DR9iMwLfxmOF3ETAc4D3DO1H4qaq6f+FPnEThPfVTv2E/Am6pOlmKT/6yaWVzrYGrPlMvrhnapdFFz+myNLqD5wy9LY021jLzT+JJdQNF083QKQ5Lo21V1aaDwHlpdNHoc1UapcFhb5CgY4Hj7Tr/zjfcW2a3eoiKgwAAAABJRU5ErkJggg=="
        }],
        type: "toolbar",
        linkAttributes: {},
        smoothLinks: void 0
    },
    initialize: function (a) {
        console.log(this.collection);
        console.log(this.model);
        console.log(this);
        this.options = Object.assign({}, _.result(this, "options"), a || {}); 
        _.defaults(this.options, {
            paper: this.options.cellView.paper,
            graph: this.options.cellView.paper.model
        }); 
        //_.bindAll(this, "pointermove", "pointerup", "render", "update", "remove");
        //this.bind("pointermove", this.pointermove, this);
        // this.bind("pointerup", this.pointerup, this);
        // this.bind("render", this.render, this);
        // this.bind("update", this.update, this);
        // this.bind("remove", this.remove, this);
        this.on("remove", this.render, this)
        this.on("pointermove", this.pointermove, this)
        this.on("pointerup", this.pointerup, this)
        console.log(this);
        joint.ui.ElementActions.clear(this.options.paper);
        this.listenTo(this.options.graph, "reset", this.remove);
        this.listenTo(this.options.graph, "all", this.update);
        this.listenTo(this.options.paper, "blank:pointerdown halo:create", this.remove);
        this.listenTo(this.options.paper, "scale translate", this.update);
        this.listenTo(this.options.cellView.model, "remove", this.remove);
        $(document.body).on("mousemove touchmove", this.pointermove);
        $(document).on("mouseup touchend", this.pointerup);
        this.options.paper.$el.append(this.$el);
        this.handles = [];
         _.each(this.options.handles, this.addHandle, this);
    },
    render: function () {
        const options = this.options;
        this.$el.empty();
        this.$handles = $("<div/>").addClass("holder").appendTo(this.el);
        this.$box = $("<label/>").addClass("box").appendTo(this.el);
        this.$el.addClass(options.type);
        this.$el.attr("data-type", options.cellView.model.get("type"));
        this.$handles.append(Object.values(this.handles).map(this.renderHandle));
        this.update();
        this.$el.addClass("animate").appendTo(options.paper.el);
        return this;
    },
    update: function () {
        const cellView = this.options.cellView;
        if (!(cellView.model instanceof joint.dia.Link)) {
            const viewBox = cellView.getBBox({
                useModelGeometry: this.options.useModelGeometry
            });
            this.$el.css({
                width: viewBox.width,
                height: viewBox.height,
                left: viewBox.x,
                top: viewBox.y
            });
        }
    },
    addHandle: function (action) {
        this.handles.push(action);
        Object.keys(action.events).forEach(key => {
            if(typeof action.events[key] === "string") {
                this.on("action:" + action.name + ":" + key, this[action.events[key]], this);
            } else {
                this.on("action:" + action.name + ":" + key, action.events[key]);
            }
        });
        if (this.$handles) {
            console.log("addHandle");
            this.renderHandle(action).appendTo(this.$handles);
        }
        return this;
    },
    renderHandle: function (action) {
        console.log(action);
        const divAction = $("<div/>").addClass("item")
                        .addClass(action.name)
                        .attr("data-action", action.name)
                        .prop("draggable", false);
        if(action.icon) {    
            divAction.css("background-image", "url(" + action.icon + ")");
            joint.util.setAttributesBySelector(divAction, action.attrs);
        }
        return divAction;
    },
    removeHandle: function (event) {
        const actionId = this.handles.findIndex(element => element.name === event);
        const action = this.handles[actionId];
        if (action) {
            Object.keys(action.events).forEach(actionEvent => {
                this.off("action:" + event + ":" + actionEvent);
            });
            this.$(".item." + event).remove();
            this.handles.splice(actionId, 1);
        }
        return this;
    },
    onHandlePointerDown: function (event) {
        this.currentAction = $(event.target).closest(".item").attr("data-action");
        if(this.currentAction) {
            event.preventDefault(); 
            event.stopPropagation(); 
            event = joint.util.normalizeEvent(event); 
            this._clientX = event.clientX; 
            this._clientY = event.clientY; 
            this._startClientX = this._clientX; 
            this._startClientY = this._clientY; 
            this.triggerAction(this.currentAction, "pointerdown", event);
        }
    },
    triggerAction: function (actionName, eventName) {
        const action = Array.prototype.slice.call(arguments, 2);
        action.unshift("action:" + actionName + ":" + eventName); 
        this.trigger.apply(this, action);
    },
    startLinking: function (a) {
        this.options.graph.trigger("batch:start");
        var b = this.options.cellView,
            c = $.data(a.target, "selector"),
            d = this.options.paper.getDefaultLink(b, c && b.el.querySelector(c));
        d.set("source", {
            id: b.model.id,
            selector: c
        }), d.set("target", {
            x: a.clientX,
            y: a.clientY
        }), d.attr(this.options.linkAttributes), _.isBoolean(this.options.smoothLinks) && d.set("smooth", this.options.smoothLinks), this.options.graph.addCell(d, {
            validation: !1,
            halo: this.cid
        }), d.set("target", this.options.paper.snapToGrid({
            x: a.clientX,
            y: a.clientY
        })), this._linkView = this.options.paper.findViewByModel(d), this._linkView.startArrowheadMove("target")
    },
    startResizing: function (a) {
        this.options.graph.trigger("batch:start");
        this._flip = [1, 0, 0, 1, 1, 0, 0, 1][Math.floor(joint.g.normalizeAngle(this.options.cellView.model.get("angle")) / 45)];
    },
    doResize: function (a, b, c) {
        var d = this.options.cellView.model.get("size"),
            e = Math.max(d.width + (this._flip ? b : c), 1),
            f = Math.max(d.height + (this._flip ? c : b), 1);
        this.options.cellView.model.resize(e, f, {
            absolute: !0
        })
    },
    doLink: function (event) {
        const position = this.options.paper.snapToGrid({
            x: event.clientX,
            y: event.clientY
        });
        this._linkView.pointermove(event, position.x, position.y);
    },
    stopLinking: function (event) {
        const model = this._linkView.model;
        this._linkView.pointerup(event); 
        if(model.hasLoop()) {
            this.makeLoopLink(model);
        }
        if(this.options.paper.options.linkPinning || model.get("target").hasOwnProperty("id")) {
            this.stopBatch(); 
            this.triggerAction("link", "add", model);
        } else {
            model.remove({
                ui: true
            });
            this.stopBatch();
        }
        delete this._linkView;
    },
    pointermove: function (event) {
        if (this.currentAction) {
            event.preventDefault(); 
            event.stopPropagation(); 
            event = joint.util.normalizeEvent(event);
            const eventPosition = this.options.paper.snapToGrid({
                x: event.clientX,
                y: event.clientY
            });
            const elementPosition = this.options.paper.snapToGrid({
                x: this._clientX,
                y: this._clientY
            });
            const diffX = eventPosition.x - elementPosition.x;
            const diffY = eventPosition.y - elementPosition.y;
            this.triggerAction(this.currentAction, "pointermove", event, diffX, diffY, event.clientX - this._startClientX, event.clientY - this._startClientY); 
            this._clientX = event.clientX; 
            this._clientY = event.clientY;
        }
    },
    pointerup: function (event) {
        if(this.currentAction) {
            this.triggerAction(this.currentAction, "pointerup", event); 
            delete this.currentAction;
        }
    },
    stopBatch: function () {
        this.options.graph.trigger("batch:stop");
    },
    remove: function () {
        Backbone.View.prototype.remove.apply(this, arguments);
        $(document.body).off("mousemove touchmove", this.pointermove);
        $(document).off("mouseup touchend", this.pointerup);
    },
    removeElement: function () {
        this.options.cellView.model.remove();
    },
    unlinkElement: function () {
        this.options.graph.removeLinks(this.options.cellView.model);
    },
    makeLoopLink: function (a) {
        console.log("makeLoopLink");
        var b, c, d = this.options.loopLinkWidth,
            e = this.options.paper.options,
            f = joint.g.rect({
                x: 0,
                y: 0,
                width: e.width,
                height: e.height
            }),
            h = V(this.options.cellView.el).bbox(!1, this.options.paper.viewport),
            i = _.uniq([this.options.loopLinkPreferredSide, "top", "bottom", "left", "right"]),
            j = _.find(i, function (a) {
                var e, i = 0,
                    j = 0;
                switch (a) {
                    case "top":
                        e = joint.g.point(h.x + h.width / 2, h.y - d), i = d / 2;
                        break;
                    case "bottom":
                        e = joint.g.point(h.x + h.width / 2, h.y + h.height + d), i = d / 2;
                        break;
                    case "left":
                        e = joint.g.point(h.x - d, h.y + h.height / 2), j = d / 2;
                        break;
                    case "right":
                        e = joint.g.point(h.x + h.width + d, h.y + h.height / 2), j = d / 2
                }
                return b = joint.g.point(e).offset(-i, -j), c = joint.g.point(e).offset(i, j), f.containsPoint(b) && f.containsPoint(c)
            }, this);
        j && a.set("vertices", [b, c])
    }
}, {
    clear: function (a) {
        a.trigger("halo:create");
    }
});