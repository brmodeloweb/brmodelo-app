import $ from "jquery";
import "backbone";
import * as joint from "jointjs/dist/joint";

joint.ui.ElementActions = Backbone.View.extend({
    className: "element-action",
    events: {
        "mousedown .item": "onActionPointerDown",
        "touchstart .item": "onActionPointerDown",
    },
    options: {
        useModelGeometry: !1,
        actions: [{
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
        linkAttributes: {}
    },
	initialize(configs) {
		this.options = { ...this.options, ...configs } || {};
		this.options = {
			...this.options,
			paper: this.options.cellView.paper,
			graph: this.options.cellView.paper.model
		};

		this.pointermove = this.pointermove.bind(this);
		this.pointerup = this.pointerup.bind(this);
		this.render = this.render.bind(this);
		this.updateElement = this.updateElement.bind(this);
		this.remove = this.remove.bind(this);


		joint.ui.ElementActions.clear(this.options.paper);
		this.listenTo(this.options.graph, "reset", this.remove);
		this.listenTo(this.options.graph, "all", this.updateElement);
		this.listenTo(this.options.paper, "blank:pointerdown element-actions:activate", this.remove);
		this.listenTo(this.options.paper, "scale translate", this.updateElement);
		this.listenTo(this.options.cellView.model, "remove", this.remove);

		$(document.body).on("mousemove touchmove", this.pointermove);
		$(document).on("mouseup touchend", this.pointerup);

		this.options.paper.$el.append(this.$el);

		this.actions = [];
		this.options.actions.forEach(this.addAction, this);
	},
    render: function () {
        const options = this.options;
        this.$el.empty();
        this.$actions = $("<div/>").addClass("holder").appendTo(this.el);
        this.$box = $("<label/>").addClass("box").appendTo(this.el);
        this.$el.addClass(options.type);
        this.$el.attr("data-type", options.cellView.model.get("type"));
        this.$actions.append(Object.values(this.actions).map(this.renderAction));
        this.updateElement();
        this.$el.addClass("animate").appendTo(options.paper.el);
        return this;
    },
    updateElement: function () {
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
    addAction: function (action) {
        this.actions.push(action);
        Object.keys(action.events).forEach(key => {
            if(typeof action.events[key] === "string") {
                this.on("action:" + action.name + ":" + key, this[action.events[key]], this);
            } else {
                this.on("action:" + action.name + ":" + key, action.events[key]);
            }
        });
        if (this.$actions) {
            this.renderAction(action).appendTo(this.$actions);
        }
        return this;
    },
    renderAction: function (action) {
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
    removeAction: function (event) {
        const actionId = this.actions.findIndex(element => element.name === event);
        const action = this.actions[actionId];
        if (action) {
            Object.keys(action.events).forEach(actionEvent => {
                this.off("action:" + event + ":" + actionEvent);
            });
            this.$(".item." + event).remove();
            this.actions.splice(actionId, 1);
        }
        return this;
    },
    onActionPointerDown: function (event) {
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
    startLinking: function (event) {
        this.options.graph.trigger("batch:start");
        const originView = this.options.cellView;
        const selector = $.data(event.target, "selector");
        const newLink = this.options.paper.getDefaultLink(originView, selector && originView.el.querySelector(selector));
        newLink.set("source", {
            id: originView.model.id,
            selector: selector
        });
        newLink.set("target", {
            x: event.clientX,
            y: event.clientY
        });
        newLink.attr(this.options.linkAttributes);
        this.options.graph.addCell(newLink, {
            validation: !1,
            halo: this.cid
        });
        newLink.set("target", this.options.paper.snapToGrid({
            x: event.clientX,
            y: event.clientY
        }));
        this._linkView = this.options.paper.findViewByModel(newLink);
        this._linkView.startArrowheadMove("target");
    },
    startResizing: function () {
        this.options.graph.trigger("batch:start");
        this._flip = [1, 0, 0, 1, 1, 0, 0, 1][Math.floor(joint.g.normalizeAngle(this.options.cellView.model.get("angle")) / 45)];
    },
    doResize: function (event, xOffset, yOffset) {
        const modelSize = this.options.cellView.model.get("size");
        const maxXOffset = Math.max(modelSize.width + (this._flip ? xOffset : yOffset), 1);
        const maxYOffset = Math.max(modelSize.height + (this._flip ? yOffset : xOffset), 1);
        this.options.cellView.model.resize(maxXOffset, maxYOffset, {
            absolute: !0
        });
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
}, {
    clear: function (editor) {
        editor.trigger("element-actions:activate");
    }
});