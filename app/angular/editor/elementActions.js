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
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2RpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo2NjREODhDMjc4MkVFMjExODUyOEU5NTNCRjg5OEI3QiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDowQTc4MzUwQjJGMEIxMUUyOTFFNUE1RTAwQ0EwMjU5NyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowQTc4MzUwQTJGMEIxMUUyOTFFNUE1RTAwQ0EwMjU5NyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2NjREODhDMjc4MkVFMjExODUyOEU5NTNCRjg5OEI3QiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2NjREODhDMjc4MkVFMjExODUyOEU5NTNCRjg5OEI3QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pk3oY88AAAEMSURBVHja7JftDYMgEIbRdABHcARG6CalGziCG3QE3KAj0A0cod3AEa6YUEMpcKeI9oeXvP5QuCeA90EBAGwPK7SU1hkZ12ldiT6F1oUycARDRHLBgiTiEzCwTNhNuRT8XOEog/AyMqlOXPEuZzx7q29aXGtIhLvQwfNuAgtrYgrcB+VWqH2BhceBD45ZE4EyB/7zIQTvCeAWgdpw1CqT2Sri2LsRZ4cddtg/GLfislo55oNZxE2ZLcFXT8haU7YED9yXpxsCGMvTn4Uqe7DIXJnsAqGYB5CjFnNT6yEE3qr7iIJT+60YXJUZQ3G8ALyof+JWfTV6xrluEuqkHw/ESW3CoJsBRVubtwADAI2b6h9uJAFqAAAAAElFTkSuQmCC"
        }, {
            name: "remove",
            position: "nw",
            events: {
                pointerdown: "removeElement"
            },
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAO5JREFUeNrUV9sNwyAMtLoAI3SEjJIRMgqjdBRG8CiMQGnlVHwEOBAE19L9OdwRGz+IcNsibISLCBk48dlooB0RXCDNgeXbbntWbovCyVlNtkf4AeQnvJwJ//IwCQdy8zAZeynm/gYBPpcT7gbyNDGb4/4CnyOLb1M+MED+MVPxZfEhQASnFQ4hp4qIlJxAEd+KaQGlpiIC8bmCRZOvRNBL/kvGltp+RdRLfqK5wZhCITMdjaury5lB5OFBCuxvQjAtCZc/w+WFaHkpXt6MVLTj5QOJipFs+VCqYixXsZioWM1GLaf7yK45ZT1/CzAAESidXQn9F/MAAAAASUVORK5CYII="
        }, {
            name: "link",
            position: "e",
            events: {
                pointerdown: "startLinking",
                pointermove: "doLink",
                pointerup: "stopLinking"
            },
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjIwRkVFNkM3MkU3RjExRTJBMDA3RkZBQzMyMzExQzIzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjIwRkVFNkM4MkU3RjExRTJBMDA3RkZBQzMyMzExQzIzIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MjBGRUU2QzUyRTdGMTFFMkEwMDdGRkFDMzIzMTFDMjMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MjBGRUU2QzYyRTdGMTFFMkEwMDdGRkFDMzIzMTFDMjMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5hjT/5AAAA8ElEQVR42syXwQ3DIAxFUbtAR+gIHLsSN2+SboA6CSOEMbghJqCAHKlNmwYwkWvpKwdinmRsY4Sos2sSJJkknxRX8rgG+C/ZJG4YG2XQt9kuSVMHcK0J96qGzgOgi+Ya+GhoFfwo6C5890wBIGqto5SScuYf2fvTKcMW895T4G/ZblrARLh5bQ5VTjnMg+ClyUCL0yA4iJ7ONABewu17koQIz8z+2iTCaY3hG7zG7yQYjS3UbMnFVk5sDYStZbJdEizX4hnBDqeD21bNOedECKF8lVLCWttTuvekx9+MPmzDHut4yzrQsz5hDn+0PQUYAOGQcmTsT0IpAAAAAElFTkSuQmCC"
        }, {
            name: "unlink",
            position: "w",
            events: {
                pointerdown: "unlinkElement"
            },
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjJCNjcxNUZBMkU3RjExRTI5RURCRDA5NDlGRDBFMDgwIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjJCNjcxNUZCMkU3RjExRTI5RURCRDA5NDlGRDBFMDgwIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MkI2NzE1RjgyRTdGMTFFMjlFREJEMDk0OUZEMEUwODAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MkI2NzE1RjkyRTdGMTFFMjlFREJEMDk0OUZEMEUwODAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5htS6kAAABHElEQVR42uxW0Q2DIBBV0wEcwRHsBo7QERjBbkAnYARGaDdghI5gN9ANKCRHQy4HxFakH77kxeTAe95xd1JrrasSaKpCOIR3R2+oDLXHp+GQU3RAYhyezsZyCU8gwJGdgX3+wXcHfi1HyOwHGsQpuMjXprwFMU3QavGTtzHkwGJZIXoxFBBtyOer8opKog0ykQ0qrSoQpTsy7gfZg9EtKu/cnbBvm4iC454PijKUgQ4WYy9rot0Y6gBMhQvKoY70dYs+TERqAcOe4dXwsUXbWdF7IgsztM3/jsziqd69uLZqp/GbdgoNEJF7gMR+BC7KfuXInBIfwJrELF4Ss5yCLaiz4S3isyv6W8QXAbHXRaDI1ac+LvSHcC68BRgAHv/CnODh8mEAAAAASUVORK5CYII="
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