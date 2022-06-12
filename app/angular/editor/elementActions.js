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
        boxContent: function(a, b) {
            var c = _.template("x: <%= x %>, y: <%= y %>, width: <%= width %>, height: <%= height %>, angle: <%= angle %>"),
                d = a.model.getBBox();
            return c({
                x: Math.floor(d.x),
                y: Math.floor(d.y),
                width: d.width,
                height: d.height,
                angle: Math.floor(a.model.get("angle") || 0)
            })
        },
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
        }, {
            name: "unlink",
            position: "w",
            events: {
                pointerdown: "unlinkElement"
            },
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAABJElEQVRIie2VMY7CMBBFH4iOE4AW2HOgbTkOR9otgQ6JbqFEXGCh4AgEgbRQUAJFjGSssZMYJgXiS1ZGdjJvPJ5x4K18qgM/wF+Z0A9gCVzMKE0TC5oHvADm7mQ1Atwr+P4ZIcBKBNh1EuMjasd5JKa3DLCYXlsvkerM9GqBM9MbUhMYAUdgb+zOc+IKQ7fcXw4XYAO0NcEjA/oFWgY2FQJ5ZKwl8MEstqy5tsdBF/iKAH/fHEvFVfHYtqqBNZ9WQF9auKV6SrrTDjAToi46TsCYtIZENYFE+NAtLnf9KWoAA9Lz3hnbrWgVcJakYlNtNYBP5KNIUL5kQn0+1ATv8ff5rqizIj+JmnlKfV5DUaE+H2iCfX2ekLahquw+/ze2OvQ1dAXkqpMWpBLIcQAAAABJRU5ErkJggg=="
        }],
        type: "toolbar",
        linkAttributes: {},
        smoothLinks: void 0
    },
    initialize: function(a) {
        this.options = _.extend({}, _.result(this, "options"), a || {}), _.defaults(this.options, {
            paper: this.options.cellView.paper,
            graph: this.options.cellView.paper.model
        }), _.bindAll(this, "pointermove", "pointerup", "render", "update", "remove"),
        joint.ui.ElementActions.clear(this.options.paper),
        this.listenTo(this.options.graph, "reset", this.remove),
        this.listenTo(this.options.graph, "all", this.update),
        this.listenTo(this.options.paper, "blank:pointerdown halo:create", this.remove),
        this.listenTo(this.options.paper, "scale translate", this.update),
        this.listenTo(this.options.cellView.model, "remove", this.remove),
        $(document.body).on("mousemove touchmove", this.pointermove),
        $(document).on("mouseup touchend", this.pointerup),
        this.options.paper.$el.append(this.$el),
        this.handles = [], _.each(this.options.handles, this.addHandle, this)
    },
    render: function() {
        const options = this.options;
        this.$el.empty();
        this.$handles = $("<div/>").addClass("holder").appendTo(this.el);
        this.$box = $("<label/>").addClass("box").appendTo(this.el);
        this.$el.addClass(options.type);
        this.$el.attr("data-type", options.cellView.model.get("type"));
        this.$handles.append(_.map(this.handles, this.renderHandle, this));
        this.update(); 
        this.$el.addClass("animate").appendTo(options.paper.el);
        return this;
    },
    update: function() {
        const cellView = this.options.cellView;
        if (!(cellView.model instanceof joint.dia.Link)) {
            const viewBox = cellView.getBBox({
                useModelGeometry: this.options.useModelGeometry
            });
            this.$el.toggleClass("tiny", viewBox.width < this.options.tinyThreshold && viewBox.height < this.options.tinyThreshold); 
            this.$el.toggleClass("small", !this.$el.hasClass("tiny") && viewBox.width < this.options.smallThreshold && viewBox.height < this.options.smallThreshold); 
            this.$el.css({
                width: viewBox.width,
                height: viewBox.height,
                left: viewBox.x,
                top: viewBox.y
            });
            if(this.hasHandle("unlink")) {
                this.toggleUnlink();
            }
        }
    },
    addHandle: function(a) {
        var b = this.getHandle(a.name);
        if (!b && (this.handles.push(a), _.each(a.events, function(b, c) {
                _.isString(b) ? this.on("action:" + a.name + ":" + c, this[b], this) : this.on("action:" + a.name + ":" + c, b)
            }, this), this.$handles)) {
                console.log("addHandle");
            this.renderHandle(a).appendTo(this.$handles)
        }
        return this
    },
    renderHandle: function(a) {
        var b = this.getHandleIdx(a.name),
            c = $("<div/>").addClass("item").addClass(a.name).attr("data-action", a.name).prop("draggable", !1);
        switch (this.options.type) {
            case "toolbar":
            case "surrounding":
                c.addClass(a.position), a.content && c.html(a.content);
                break;
        }
        return a.icon && this.setHandleIcon(c, a.icon), joint.util.setAttributesBySelector(c, a.attrs), c
    },
    setHandleIcon: function(elementDiv, imageUrl) {
        elementDiv.css("background-image", "url(" + imageUrl + ")");
    },
    removeHandle: function(event) { 
        const actionId = this.getHandleIdx(event);
        const action = this.handles[actionId];
        if(action) {
            Object.keys(action.events).forEach(actionEvent => {
             this.off("action:" + event + ":" + actionEvent);
            });
            this.$(".item." + event).remove();
            this.handles.splice(actionId, 1);
        }
        return this;
    },
    changeHandle: function(a, b) {
        var c = this.getHandle(a);
        return c && (this.addHandle(_.merge({
            name: a
        }, c, b))), this
    },
    hasHandle: function(a) {
        return -1 !== this.getHandleIdx(a)
    },
    getHandleIdx: function(a) {
        return _.findIndex(this.handles, {
            name: a
        })
    },
    getHandle: function(a) {
        return _.findWhere(this.handles, {
            name: a
        })
    },
    onHandlePointerDown: function(a) {
        this._action = $(a.target).closest(".item").attr("data-action"),
        this._action && (a.preventDefault(), a.stopPropagation(), a = joint.util.normalizeEvent(a), this._clientX = a.clientX, this._clientY = a.clientY, this._startClientX = this._clientX, this._startClientY = this._clientY, this.triggerAction(this._action, "pointerdown", a))
    },
    triggerAction: function(a, b, c) {
        var d = Array.prototype.slice.call(arguments, 2);
        d.unshift("action:" + a + ":" + b), this.trigger.apply(this, d)
    },
    startLinking: function(a) {
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
    startResizing: function(a) {
        this.options.graph.trigger("batch:start"), this._flip = [1, 0, 0, 1, 1, 0, 0, 1][Math.floor(joint.g.normalizeAngle(this.options.cellView.model.get("angle")) / 45)]
    },
    doResize: function(a, b, c) {
        var d = this.options.cellView.model.get("size"),
            e = Math.max(d.width + (this._flip ? b : c), 1),
            f = Math.max(d.height + (this._flip ? c : b), 1);
        this.options.cellView.model.resize(e, f, {
            absolute: !0
        })
    },
    doLink: function(a) {
        var b = this.options.paper.snapToGrid({
            x: a.clientX,
            y: a.clientY
        });
        this._linkView.pointermove(a, b.x, b.y)
    },
    stopLinking: function(a) {
        var b = this._linkView,
            c = b.model;
        b.pointerup(a), c.hasLoop() && this.makeLoopLink(c), this.options.paper.options.linkPinning || _.has(c.get("target"), "id") ? (this.stopBatch(), this.triggerAction("link", "add", c)) : (c.remove({
            ui: !0
        }), this.stopBatch()), delete this._linkView
    },
    pointermove: function(a) {
        if (this._action) {
            a.preventDefault(), a.stopPropagation(), a = joint.util.normalizeEvent(a);
            var b = this.options.paper.snapToGrid({
                    x: a.clientX,
                    y: a.clientY
                }),
                c = this.options.paper.snapToGrid({
                    x: this._clientX,
                    y: this._clientY
                }),
                d = b.x - c.x,
                e = b.y - c.y;
            this.triggerAction(this._action, "pointermove", a, d, e, a.clientX - this._startClientX, a.clientY - this._startClientY), this._clientX = a.clientX, this._clientY = a.clientY
        }
    },
    pointerup: function(a) {
        this._action && (this.triggerAction(this._action, "pointerup", a), delete this._action)
    },
    stopBatch: function() {
        this.options.graph.trigger("batch:stop");
    },
    remove: function() {
        Backbone.View.prototype.remove.apply(this, arguments); 
        $(document.body).off("mousemove touchmove", this.pointermove); 
        $(document).off("mouseup touchend", this.pointerup);
    },
    removeElement: function() {
        this.options.cellView.model.remove();
    },
    unlinkElement: function() {
        this.options.graph.removeLinks(this.options.cellView.model);
    },
    toggleUnlink: function() {
        console.log(" toggleUnlink ");
        var a = this.options.graph.getConnectedLinks(this.options.cellView.model).length > 0;
        this.$handles.children(".unlink").toggleClass("hidden", !a)
    },
    makeLoopLink: function(a) {
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
            j = _.find(i, function(a) {
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
    clear: function(a) {
        a.trigger("halo:create");
    }
});