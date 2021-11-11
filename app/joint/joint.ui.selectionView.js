import $ from "jquery";
import _ from "underscore";
import "backbone";
import * as joint from "jointjs";

joint.ui.SelectionView = Backbone.View.extend({
    options: {
        paper: void 0,
        graph: void 0,
        boxContent: function(a) {
            // var b = _.template("<%= length %> elements selected.");
            // return b({
            //     length: this.model.length
            // })
        },
        handles: [{
            name: "remove",
            position: "nw",
            events: {
                pointerdown: "removeElements"
            }
        }, {
            name: "rotate",
            position: "sw",
            events: {
                pointerdown: "startRotating",
                pointermove: "doRotate",
                pointerup: "stopBatch"
            }
        }],
        useModelGeometry: !1
    },
    className: "selection",
    events: {
        "mousedown .selection-box": "startTranslatingSelection",
        "touchstart .selection-box": "startTranslatingSelection",
        "mousedown .handle": "onHandlePointerDown",
        "touchstart .handle": "onHandlePointerDown"
    },
    initialize: function(a) {
        if (this.options = _.extend({}, _.result(this, "options"), a || {}), !a.paper) throw new Error("SelectionView: paper required");
        _.defaults(this.options, {
            graph: a.paper.model
        }), _.bindAll(this, "startSelecting", "stopSelecting", "adjustSelection", "pointerup"), $(document.body).on("mousemove.selectionView touchmove.selectionView", this.adjustSelection), $(document).on("mouseup.selectionView touchend.selectionView", this.pointerup), this.listenTo(this.options.graph, "reset", this.cancelSelection), this.listenTo(this.options.paper, "scale translate", this.updateSelectionBoxes), this.listenTo(this.options.graph, "remove change", function(a, b) {
            b["selectionView_" + this.cid] || this.updateSelectionBoxes()
        }), this.options.paper.$el.append(this.$el), this._boxCount = 0, this.$selectionWrapper = this.createSelectionWrapper(), this.handles = [], _.each(this.options.handles, this.addHandle, this)
    },
    addHandle: function(a) {
        this.handles.push(a);
        var b = $("<div/>", {
            "class": "handle " + (a.position || "") + " " + (a.name || ""),
            "data-action": a.name
        });
        return a.icon && b.css("background-image", "url(" + a.icon + ")"), b.html(a.content || ""), this.$selectionWrapper.append(b), _.each(a.events, function(b, c) {
            _.isString(b) ? this.on("action:" + a.name + ":" + c, this[b], this) : this.on("action:" + a.name + ":" + c, b)
        }, this), this
    },
    removeHandle: function(a) {
        var b = _.findIndex(this.handles, {
                name: a
            }),
            c = this.handles[b];
        return c && (_.each(c.events, function(b, c) {
            this.off("action:" + a + ":" + c)
        }, this), this.$(".handle." + a).remove(), this.handles.splice(b, 1)), this
    },
    changeHandle: function(a, b) {
        var c = _.findWhere(this.handles, {
            name: a
        });
        return c && (this.removeHandle(a), this.addHandle(_.merge({
            name: a
        }, c, b))), this
    },
    startTranslatingSelection: function(a) {
        a.stopPropagation(), a = joint.util.normalizeEvent(a), this._action = "translating", this.options.graph.trigger("batch:start");
        var b = this.options.paper.snapToGrid(joint.g.point(a.clientX, a.clientY));
        this._snappedClientX = b.x, this._snappedClientY = b.y, this.trigger("selection-box:pointerdown", a)
    },
    startSelecting: function(a) {
        a = joint.util.normalizeEvent(a), this.cancelSelection(), this._action = "selecting", this._clientX = a.clientX, this._clientY = a.clientY;
        var b = a.target.parentElement || a.target.parentNode,
            c = $(b).offset(),
            d = b.scrollLeft,
            e = b.scrollTop;
        this._offsetX = void 0 === a.offsetX ? a.clientX - c.left + window.pageXOffset + d : a.offsetX, this._offsetY = void 0 === a.offsetY ? a.clientY - c.top + window.pageYOffset + e : a.offsetY, this.$el.css({
            width: 1,
            height: 1,
            left: this._offsetX,
            top: this._offsetY
        }).show()
    },
    adjustSelection: function(a) {
        a = joint.util.normalizeEvent(a);
        var b, c;
        switch (this._action) {
            case "selecting":
                b = a.clientX - this._clientX, c = a.clientY - this._clientY;
                var d = (this.$el.width(), this.$el.height(), parseInt(this.$el.css("left"), 10)),
                    e = parseInt(this.$el.css("top"), 10);
                this.$el.css({
                    left: 0 > b ? this._offsetX + b : d,
                    top: 0 > c ? this._offsetY + c : e,
                    width: Math.abs(b),
                    height: Math.abs(c)
                });
                break;
            case "translating":
                var f = this.options.paper.snapToGrid(joint.g.point(a.clientX, a.clientY)),
                    h = f.x,
                    i = f.y;
                if (b = h - this._snappedClientX, c = i - this._snappedClientY, b || c) {
                    var j = {};
                    if (this.model.each(function(a) {
                            if (!j[a.id]) {
                                var d = {};
                                d["selectionView_" + this.cid] = !0, a.translate(b, c, d), _.each(a.getEmbeddedCells({
                                    deep: !0
                                }), function(a) {
                                    j[a.id] = !0
                                });
                                var e = this.options.graph.getConnectedLinks(a);
                                _.each(e, function(a) {
                                    j[a.id] || (a.translate(b, c, d), j[a.id] = !0)
                                })
                            }
                        }, this), this.boxesUpdated) this.model.length > 1 && this.updateSelectionBoxes();
                    else {
                        var k = joint.V(this.options.paper.viewport).scale();
                        this.$el.children(".selection-box").add(this.$selectionWrapper).css({
                            left: "+=" + b * k.sx,
                            top: "+=" + c * k.sy
                        })
                    }
                    this._snappedClientX = h, this._snappedClientY = i
                }
                this.trigger("selection-box:pointermove", a);
                break;
            default:
                this._action && this.pointermove(a)
        }
        this.boxesUpdated = !1
    },
    stopSelecting: function(a) {
        switch (this._action) {
            case "selecting":
                var b = this.$el.offset(),
                    c = this.$el.width(),
                    d = this.$el.height(),
                    e = this.options.paper,
                    f = joint.V(e.viewport).toLocalPoint(b.left, b.top);
                f.x -= window.pageXOffset, f.y -= window.pageYOffset;
                var h = joint.V(e.viewport).scale();
                c /= h.sx, d /= h.sy;
                var i = joint.g.rect(f.x, f.y, c, d),
                    j = this.options.useModelGeometry ? _.filter(_.map(e.model.findModelsInArea(i), e.findViewByModel, e)) : e.findViewsInArea(i),
                    k = this.options.filter;
                _.isArray(k) ? j = _.reject(j, function(a) {
                    return _.contains(k, a.model) || _.contains(k, a.model.get("type"))
                }) : _.isFunction(k) && (j = _.reject(j, function(a) {
                    return k(a.model)
                })), this.model.reset(_.pluck(j, "model"), {
                    ui: !0
                }), j.length ? (_.each(j, this.createSelectionBox, this), this.$el.addClass("selected")) : this.$el.hide();
                break;
            case "translating":
                this.options.graph.trigger("batch:stop"), this.trigger("selection-box:pointerup", a);
                break;
            default:
                this._action || this.cancelSelection()
        }
        delete this._action
    },
    pointerup: function(a) {
        this._action && (this.triggerAction(this._action, "pointerup", a), this.stopSelecting(), delete this._action)
    },
    cancelSelection: function() {
        this.destroyAllSelectionBoxes(), this.model.reset([], {
            ui: !0
        })
    },
    destroyAllSelectionBoxes: function() {
        this.$el.hide().children(".selection-box").remove(), this.$el.removeClass("selected"), this._boxCount = 0, this.updateSelectionWrapper()
    },
    destroySelectionBox: function(a) {
        this.$('[data-model="' + a.model.get("id") + '"]').remove(), 0 === this.$el.children(".selection-box").length && this.$el.hide().removeClass("selected"), this._boxCount = Math.max(0, this._boxCount - 1), this.updateSelectionWrapper()
    },
    createSelectionBox: function(a) {
        var b = a.getBBox({
                useModelGeometry: this.options.useModelGeometry
            }),
            c = $("<div/>", {
                "class": "selection-box",
                "data-model": a.model.get("id")
            });
        c.css({
            left: b.x,
            top: b.y,
            width: b.width,
            height: b.height
        }), this.$el.append(c), this.$el.addClass("selected").show(), this._boxCount++, this.updateSelectionWrapper()
    },
    createSelectionWrapper: function() {
        var a = $("<div/>", {
                "class": "selection-wrapper"
            }),
            b = $("<div/>", {
                "class": "box"
            });
        return a.append(b), a.attr("data-selection-length", this.model.length), this.$el.prepend(a), a
    },
    updateSelectionWrapper: function() {
        var a = {
                x: 1 / 0,
                y: 1 / 0
            },
            b = {
                x: 0,
                y: 0
            };
        if (this.model.each(function(c) {
                var d = this.options.paper.findViewByModel(c);
                if (d) {
                    var e = d.getBBox({
                        useModelGeometry: this.options.useModelGeometry
                    });
                    a.x = Math.min(a.x, e.x), a.y = Math.min(a.y, e.y), b.x = Math.max(b.x, e.x + e.width), b.y = Math.max(b.y, e.y + e.height)
                }
            }, this), this.$selectionWrapper.css({
                left: a.x,
                top: a.y,
                width: b.x - a.x,
                height: b.y - a.y
            }).attr("data-selection-length", this.model.length), _.isFunction(this.options.boxContent)) {
            var c = this.$(".box"),
                d = this.options.boxContent.call(this, c[0]);
            d && c.html(d)
        }
    },
    updateSelectionBoxes: function() {
        if (this._boxCount) {
            var a = this.$el.hide().removeClass("selected").children(".selection-box");
            _.each(a, function(a) {
                var b = $(a).remove().attr("data-model"),
                    c = this.model.get(b),
                    d = c && this.options.paper.findViewByModel(c);
                d && this.createSelectionBox(d)
            }, this), this.updateSelectionWrapper(), this.boxesUpdated = !0
        }
    },
    remove: function() {
        Backbone.View.prototype.remove.apply(this, arguments), $(document.body).off(".selectionView", this.adjustSelection), $(document).off(".selectionView", this.pointerup)
    },
    onHandlePointerDown: function(a) {
        this._action = $(a.target).closest(".handle").attr("data-action"), this._action && (a.preventDefault(), a.stopPropagation(), a = joint.util.normalizeEvent(a), this._clientX = a.clientX, this._clientY = a.clientY, this._startClientX = this._clientX, this._startClientY = this._clientY, this.triggerAction(this._action, "pointerdown", a))
    },
    pointermove: function(a) {
        if (this._action) {
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
    triggerAction: function(a, b, c) {
        var d = Array.prototype.slice.call(arguments, 2);
        d.unshift("action:" + a + ":" + b), this.trigger.apply(this, d)
    },
    removeElements: function(a) {
        var b = this.model.models;
        this.cancelSelection(), this.options.graph.trigger("batch:start"), _.invoke(b, "remove"), this.options.graph.trigger("batch:stop")
    },
    startRotating: function(a) {
        this.options.graph.trigger("batch:start");
        var b = this.options.graph.getBBox(this.model.models);
        if (this._center = b.center(), "undefined" == typeof a.offsetX || "undefined" == typeof a.offsetY) {
            var c = $(a.target).offset();
            a.offsetX = a.pageX - c.left, a.offsetY = a.pageY - c.top
        }
        this._rotationStart = joint.g.point(a.offsetX + a.target.parentNode.offsetLeft, a.offsetY + a.target.parentNode.offsetTop + a.target.parentNode.offsetHeight), this._rotationStartAngle = {}, this.model.each(function(a) {
            this._rotationStartAngle[a.id] = a.get("angle") || 0
        }, this)
    },
    doRotate: function(a, b, c, d, e) {
        var f = joint.g.point(this._rotationStart).offset(d, e),
            h = f.distance(this._center),
            i = this._center.distance(this._rotationStart),
            j = this._rotationStart.distance(f),
            k = (this._center.x - this._rotationStart.x) * (f.y - this._rotationStart.y) - (this._center.y - this._rotationStart.y) * (f.x - this._rotationStart.x),
            l = Math.acos((h * h + i * i - j * j) / (2 * h * i));
        0 >= k && (l = -l);
        var m = -joint.g.toDeg(l);
        m = joint.g.snapToGrid(m, 15), this.model.each(function(a) {
            a.rotate(m + this._rotationStartAngle[a.id], !0, this._center)
        }, this)
    },
    stopBatch: function() {
        this.options.graph.trigger("batch:stop")
    },
    getAction: function() {
        return this._action
    }
});
