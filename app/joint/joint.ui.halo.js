var Handlebars = {};
! function(a, b) {
    a.VERSION = "1.0.0", a.COMPILER_REVISION = 4, a.REVISION_CHANGES = {
        1: "<= 1.0.rc.2",
        2: "== 1.0.0-rc.3",
        3: "== 1.0.0-rc.4",
        4: ">= 1.0.0"
    }, a.helpers = {}, a.partials = {};
    var c = Object.prototype.toString,
        d = "[object Function]",
        e = "[object Object]";
    a.registerHelper = function(b, d, f) {
        if (c.call(b) === e) {
            if (f || d) throw new a.Exception("Arg not supported with multiple helpers");
            a.Utils.extend(this.helpers, b)
        } else f && (d.not = f), this.helpers[b] = d
    }, a.registerPartial = function(b, d) {
        c.call(b) === e ? a.Utils.extend(this.partials, b) : this.partials[b] = d
    }, a.registerHelper("helperMissing", function(a) {
        if (2 === arguments.length) return b;
        throw new Error("Missing helper: '" + a + "'")
    }), a.registerHelper("blockHelperMissing", function(b, e) {
        var f = e.inverse || function() {}, g = e.fn,
            h = c.call(b);
        return h === d && (b = b.call(this)), b === !0 ? g(this) : b === !1 || null == b ? f(this) : "[object Array]" === h ? b.length > 0 ? a.helpers.each(b, e) : f(this) : g(b)
    }), a.K = function() {}, a.createFrame = Object.create || function(b) {
        a.K.prototype = b;
        var c = new a.K;
        return a.K.prototype = null, c
    }, a.logger = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        level: 3,
        methodMap: {
            0: "debug",
            1: "info",
            2: "warn",
            3: "error"
        },
        log: function(b, c) {
            if (a.logger.level <= b) {
                var d = a.logger.methodMap[b];
                "undefined" != typeof console && console[d] && console[d].call(console, c)
            }
        }
    }, a.log = function(b, c) {
        a.logger.log(b, c)
    }, a.registerHelper("each", function(b, e) {
        var f, g = e.fn,
            h = e.inverse,
            i = 0,
            j = "",
            k = c.call(b);
        if (k === d && (b = b.call(this)), e.data && (f = a.createFrame(e.data)), b && "object" == typeof b)
            if (b instanceof Array)
                for (var l = b.length; l > i; i++) f && (f.index = i), j += g(b[i], {
                    data: f
                });
            else
                for (var m in b) b.hasOwnProperty(m) && (f && (f.key = m), j += g(b[m], {
                    data: f
                }), i++);
        return 0 === i && (j = h(this)), j
    }), a.registerHelper("if", function(b, e) {
        var f = c.call(b);
        return f === d && (b = b.call(this)), !b || a.Utils.isEmpty(b) ? e.inverse(this) : e.fn(this)
    }), a.registerHelper("unless", function(b, c) {
        return a.helpers["if"].call(this, b, {
            fn: c.inverse,
            inverse: c.fn
        })
    }), a.registerHelper("with", function(b, e) {
        var f = c.call(b);
        return f === d && (b = b.call(this)), a.Utils.isEmpty(b) ? void 0 : e.fn(b)
    }), a.registerHelper("log", function(b, c) {
        var d = c.data && null != c.data.level ? parseInt(c.data.level, 10) : 1;
        a.log(d, b)
    });
    var f = ["description", "fileName", "lineNumber", "message", "name", "number", "stack"];
    a.Exception = function() {
        for (var a = Error.prototype.constructor.apply(this, arguments), b = 0; b < f.length; b++) this[f[b]] = a[f[b]]
    }, a.Exception.prototype = new Error, a.SafeString = function(a) {
        this.string = a
    }, a.SafeString.prototype.toString = function() {
        return this.string.toString()
    };
    var g = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "`": "&#x60;"
    }, h = /[&<>"'`]/g,
        i = /[&<>"'`]/,
        j = function(a) {
            return g[a] || "&amp;"
        };
    a.Utils = {
        extend: function(a, b) {
            for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c])
        },
        escapeExpression: function(b) {
            return b instanceof a.SafeString ? b.toString() : null == b || b === !1 ? "" : (b = b.toString(), i.test(b) ? b.replace(h, j) : b)
        },
        isEmpty: function(a) {
            return a || 0 === a ? "[object Array]" === c.call(a) && 0 === a.length ? !0 : !1 : !0
        }
    }, a.VM = {
        template: function(b) {
            var c = {
                escapeExpression: a.Utils.escapeExpression,
                invokePartial: a.VM.invokePartial,
                programs: [],
                program: function(b, c, d) {
                    var e = this.programs[b];
                    return d ? e = a.VM.program(b, c, d) : e || (e = this.programs[b] = a.VM.program(b, c)), e
                },
                merge: function(b, c) {
                    var d = b || c;
                    return b && c && (d = {}, a.Utils.extend(d, c), a.Utils.extend(d, b)), d
                },
                programWithDepth: a.VM.programWithDepth,
                noop: a.VM.noop,
                compilerInfo: null
            };
            return function(d, e) {
                e = e || {};
                var f = b.call(c, a, d, e.helpers, e.partials, e.data),
                    g = c.compilerInfo || [],
                    h = g[0] || 1,
                    i = a.COMPILER_REVISION;
                if (h !== i) {
                    if (i > h) {
                        var j = a.REVISION_CHANGES[i],
                            k = a.REVISION_CHANGES[h];
                        throw "Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version (" + j + ") or downgrade your runtime to an older version (" + k + ")."
                    }
                    throw "Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version (" + g[1] + ")."
                }
                return f
            }
        },
        programWithDepth: function(a, b, c) {
            var d = Array.prototype.slice.call(arguments, 3),
                e = function(a, e) {
                    return e = e || {}, b.apply(this, [a, e.data || c].concat(d))
                };
            return e.program = a, e.depth = d.length, e
        },
        program: function(a, b, c) {
            var d = function(a, d) {
                return d = d || {}, b(a, d.data || c)
            };
            return d.program = a, d.depth = 0, d
        },
        noop: function() {
            return ""
        },
        invokePartial: function(c, d, e, f, g, h) {
            var i = {
                helpers: f,
                partials: g,
                data: h
            };
            if (c === b) throw new a.Exception("The partial " + d + " could not be found");
            if (c instanceof Function) return c(e, i);
            if (a.compile) return g[d] = a.compile(c, {
                data: h !== b
            }), g[d](e, i);
            throw new a.Exception("The partial " + d + " could not be compiled when running in runtime-only mode")
        }
    }, a.template = a.VM.template
}(Handlebars), this.joint = this.joint || {}, this.joint.templates = this.joint.templates || {}, this.joint.templates.halo = this.joint.templates.halo || {}, this.joint.templates.halo["box.html"] = Handlebars.template(function(a, b, c, d, e) {
    return this.compilerInfo = [4, ">= 1.0.0"], c = this.merge(c, a.helpers), e = e || {}, '<label class="box"></label>\n'
}), this.joint.templates.halo["handle.html"] = Handlebars.template(function(a, b, c, d, e) {
    function f(a) {
        var b = "";
        return b += 'style="background-image: url(' + k(typeof a === j ? a.apply(a) : a) + ')"'
    }
    this.compilerInfo = [4, ">= 1.0.0"], c = this.merge(c, a.helpers), e = e || {};
    var g, h, i = "",
        j = "function",
        k = this.escapeExpression,
        l = this,
        m = c.blockHelperMissing;
    return i += '<div class="handle ', (g = c.position) ? g = g.call(b, {
        hash: {},
        data: e
    }) : (g = b.position, g = typeof g === j ? g.apply(b) : g), i += k(g) + " ", (g = c.name) ? g = g.call(b, {
        hash: {},
        data: e
    }) : (g = b.name, g = typeof g === j ? g.apply(b) : g), i += k(g) + '" draggable="false" data-action="', (g = c.name) ? g = g.call(b, {
        hash: {},
        data: e
    }) : (g = b.name, g = typeof g === j ? g.apply(b) : g), i += k(g) + '" ', h = {
        hash: {},
        inverse: l.noop,
        fn: l.program(1, f, e),
        data: e
    }, (g = c.icon) ? g = g.call(b, h) : (g = b.icon, g = typeof g === j ? g.apply(b) : g), c.icon || (g = m.call(b, g, h)), (g || 0 === g) && (i += g), i += ">\n    ", (g = c.content) ? g = g.call(b, {
        hash: {},
        data: e
    }) : (g = b.content, g = typeof g === j ? g.apply(b) : g), (g || 0 === g) && (i += g), i += "\n</div>\n\n"
}), joint.ui.Halo = Backbone.View.extend({
    className: "halo",
    events: {
        "mousedown .handle": "onHandlePointerDown",
        "touchstart .handle": "onHandlePointerDown",
        "mousedown .pie-toggle": "onPieTogglePointerDown",
        "touchstart .pie-toggle": "onPieTogglePointerDown"
    },
    options: {
        tinyTreshold: 40,
        smallTreshold: 80,
        loopLinkPreferredSide: "top",
        loopLinkWidth: 40,
        rotateAngleGrid: 15,
        useModelGeometry: !1,
        boxContent: function(a) {
            var b = _.template("x: <%= x %>, y: <%= y %>, width: <%= width %>, height: <%= height %>, angle: <%= angle %>"),
                c = a.model.getBBox();
            return b({
                x: Math.floor(c.x),
                y: Math.floor(c.y),
                width: c.width,
                height: c.height,
                angle: Math.floor(a.model.get("angle") || 0)
            })
        },
        linkAttributes: {},
        smoothLinks: void 0,
        handles: [{
            name: "resize",
            position: "se",
            events: {
                pointerdown: "startResizing",
                pointermove: "doResize",
                pointerup: "stopBatch"
            }
        }, {
            name: "remove",
            position: "nw",
            events: {
                pointerdown: "removeElement"
            }
        }, {
            name: "clone",
            position: "n",
            events: {
                pointerdown: "startCloning",
                pointermove: "doClone",
                pointerup: "stopCloning"
            }
        }, {
            name: "link",
            position: "e",
            events: {
                pointerdown: "startLinking",
                pointermove: "doLink",
                pointerup: "stopLinking"
            }
        }, {
            name: "fork",
            position: "ne",
            events: {
                pointerdown: "startForking",
                pointermove: "doFork",
                pointerup: "stopForking"
            }
        }, {
            name: "unlink",
            position: "w",
            events: {
                pointerdown: "unlinkElement"
            }
        }, {
            name: "rotate",
            position: "sw",
            events: {
                pointerdown: "startRotating",
                pointermove: "doRotate",
                pointerup: "stopBatch"
            }
        }]
    },
    initialize: function(a) {
        this.options = _.extend({}, _.result(this, "options"), a || {}), _.defaults(this.options, {
            paper: this.options.cellView.paper,
            graph: this.options.cellView.paper.model
        }), _.bindAll(this, "pointermove", "pointerup", "render", "update", "remove"), joint.ui.Halo.clear(this.options.paper), this.handles = [], _.each(this.options.handles, this.addHandle, this), this.listenTo(this.options.graph, "reset", this.remove), this.listenTo(this.options.graph, "all", this.update), this.listenTo(this.options.paper, "blank:pointerdown halo:create", this.remove), this.listenTo(this.options.paper, "scale translate", this.update), $(document.body).on("mousemove touchmove", this.pointermove), $(document).on("mouseup touchend", this.pointerup), this.options.paper.$el.append(this.$el)

        this.options = _.extend({}, _.result(this, "options"), a || {}), _.defaults(this.options, {
            paper: this.options.cellView.paper,
            graph: this.options.cellView.paper.model
        }), _.bindAll(this, "pointermove", "pointerup", "render", "update", "remove"), this.options.clearAll && joint.ui.Halo.clear(this.options.paper), this.listenTo(this.options.graph, "reset", this.remove), this.listenTo(this.options.graph, "all", this.update), this.listenTo(this.options.paper, "blank:pointerdown halo:create", this.remove), this.listenTo(this.options.paper, "scale translate", this.update), this.listenTo(this.options.cellView.model, "remove", this.remove), $(document.body).on("mousemove touchmove", this.pointermove), $(document).on("mouseup touchend", this.pointerup), this.handles = [], _.each(this.options.handles, this.addHandle, this)


    },
    render: function() {
        return this.options.cellView.model.on("remove", this.remove), this.$el.append(joint.templates.halo["box.html"]()), this.renderMagnets(), this.update(), this.$el.addClass("animate"), this.$el.attr("data-type", this.options.cellView.model.get("type")), this.toggleFork(), this
    },
    update: function() {
        if (!(this.options.cellView.model instanceof joint.dia.Link)) {
            if (_.isFunction(this.options.boxContent)) {
                var a = this.$(".box"),
                    b = this.options.boxContent.call(this, this.options.cellView, a[0]);
                b && a.html(b)
            }
            var c = this.options.cellView.getBBox({
                useModelGeometry: this.options.useModelGeometry
            });
            this.$el.toggleClass("tiny", c.width < this.options.tinyTreshold && c.height < this.options.tinyTreshold), this.$el.toggleClass("small", !this.$el.hasClass("tiny") && c.width < this.options.smallTreshold && c.height < this.options.smallTreshold), this.$el.css({
                width: c.width,
                height: c.height,
                left: c.x,
                top: c.y
            }).show(), this.updateMagnets(), this.toggleUnlink()
        }
    },
    addHandle: function(a) {
        return this.handles.push(a), this.$el.append(joint.templates.halo["handle.html"](a)), _.each(a.events, function(b, c) {
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
    onHandlePointerDown: function(a) {
        this._action = $(a.target).closest(".handle").attr("data-action"), this._action && (a.preventDefault(), a.stopPropagation(), a = joint.util.normalizeEvent(a), this._clientX = a.clientX, this._clientY = a.clientY, this._startClientX = this._clientX, this._startClientY = this._clientY, this.triggerAction(this._action, "pointerdown", a))
    },
    triggerAction: function(a, b) {
        var c = ["action:" + a + ":" + b].concat(_.rest(_.toArray(arguments), 2));
        this.trigger.apply(this, c)
    },
    startCloning: function(a) {
        this.options.graph.trigger("batch:start");
        var b = this.options.cellView.model.clone();
        b.unset("z"), this.options.graph.addCell(b, {
            halo: this.cid
        }), this._cloneView = b.findView(this.options.paper), this._cloneView.pointerdown(a, this._clientX, this._clientY)
    },
    startLinking: function(a) {

      console.log(a);

      console.log("Starting link");

      this.options.graph.trigger("batch:start");

      console.log("Starting link 1");

      var b = this.options.cellView;

      console.log("Starting link 2");

      var c = $.data(a.target, "selector");

      console.log("Starting link 3");

      var d = this.options.paper.getDefaultLink(b, c && b.el.querySelector(c));

      console.log("Starting link 4");


      d.set("source", {
          id: b.model.id ,selector: c
      }), d.set("target", {
          x: a.clientX,
          y: a.clientY
      }), d.attr(this.options.linkAttributes), _.isBoolean(this.options.smoothLinks) && d.set("smooth", this.options.smoothLinks), this.options.graph.addCell(d, {
          validation: !1,
          halo: this.cid
      }), d.set("target", this.options.paper.snapToGrid({
          x: a.clientX,
          y: a.clientY
      })),

      console.log("Debug 1");

      this._linkView = this.options.paper.findViewByModel(d), this._linkView.startArrowheadMove("target")

      console.log("Debug 2");
    },
    startForking: function(a) {
        this.options.graph.trigger("batch:start");
        var b = this.options.cellView.model.clone();
        b.unset("z"), this.options.graph.addCell(b, {
            halo: this.cid
        });
        var c = this.options.paper.getDefaultLink(this.options.cellView);
        c.set("source", {
            id: this.options.cellView.model.id
        }), c.set("target", {
            id: b.id
        }), c.attr(this.options.linkAttributes), _.isBoolean(this.options.smoothLinks) && c.set("smooth", this.options.smoothLinks), this.options.graph.addCell(c, {
            halo: this.cid
        }), this._cloneView = b.findView(this.options.paper), this._cloneView.pointerdown(a, this._clientX, this._clientY)
    },
    startResizing: function() {
        this.options.graph.trigger("batch:start"), this._flip = [1, 0, 0, 1, 1, 0, 0, 1][Math.floor(g.normalizeAngle(this.options.cellView.model.get("angle")) / 45)]
    },
    startRotating: function(a) {
        this.options.graph.trigger("batch:start");
        var b = this.options.cellView.getBBox();
        if (this._center = g.rect(b).center(), "undefined" == typeof a.offsetX || "undefined" == typeof a.offsetY) {
            var c = $(a.target).offset();
            a.offsetX = a.pageX - c.left, a.offsetY = a.pageY - c.top
        }
        this._rotationStart = g.point(a.offsetX + a.target.parentNode.offsetLeft, a.offsetY + a.target.parentNode.offsetTop + a.target.parentNode.offsetHeight);
        var d = this.options.cellView.model.get("angle");
        this._rotationStartAngle = d || 0
    },
    doResize: function(a, b, c) {
        var d = this.options.cellView.model.get("size"),
            e = Math.max(d.width + (this._flip ? b : c), 1),
            f = Math.max(d.height + (this._flip ? c : b), 1);
        this.options.cellView.model.resize(e, f, {
            absolute: !0
        })
    },
    doRotate: function(a, b, c, d, e) {
        var f = g.point(this._rotationStart).offset(d, e),
            h = f.distance(this._center),
            i = this._center.distance(this._rotationStart),
            j = this._rotationStart.distance(f),
            k = (this._center.x - this._rotationStart.x) * (f.y - this._rotationStart.y) - (this._center.y - this._rotationStart.y) * (f.x - this._rotationStart.x),
            l = Math.acos((h * h + i * i - j * j) / (2 * h * i));
        0 >= k && (l = -l);
        var m = -g.toDeg(l);
        m = g.snapToGrid(m, this.options.rotateAngleGrid), this.options.cellView.model.rotate(m + this._rotationStartAngle, !0)
    },
    doClone: function(a) {
        this._cloneView.pointermove(a, this._clientX, this._clientY)
    },
    doFork: function(a) {
        this._cloneView.pointermove(a, this._clientX, this._clientY)
    },
    doLink: function(a) {
        var b = this.options.paper.snapToGrid({
            x: a.clientX,
            y: a.clientY
        });

        console.log(this);
        console.log(this._linkView);

        // this._linkView.pointermove(a, b.x, b.y)
    },
    stopLinking: function(a) {
        this._linkView.pointerup(a);
        var b = this._linkView.model.get("source").id,
            c = this._linkView.model.get("target").id;
        b && c && b === c && this.makeLoopLink(this._linkView.model), this.stopBatch(), this.triggerAction("link", "add", this._linkView.model), delete this._linkView
    },
    stopForking: function(a) {
        this._cloneView.pointerup(a, this._clientX, this._clientY), this.stopBatch()
    },
    stopCloning: function(a) {
        this._cloneView.pointerup(a, this._clientX, this._clientY), this.stopBatch()
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
        this.options.graph.trigger("batch:stop")
    },
    remove: function() {
        Backbone.View.prototype.remove.apply(this, arguments), $(document.body).off("mousemove touchmove", this.pointermove), $(document).off("mouseup touchend", this.pointerup)
    },
    removeElement: function() {
        this.options.cellView.model.remove()
    },
    unlinkElement: function() {
        this.options.graph.removeLinks(this.options.cellView.model)
    },
    toggleUnlink: function() {
        this.options.graph.getConnectedLinks(this.options.cellView.model).length > 0 ? this.$(".unlink").show() : this.$(".unlink").hide()
    },
    toggleFork: function() {
        var a = this.options.cellView.model.clone(),
            b = this.options.paper.createViewForModel(a);
        this.options.paper.options.validateConnection(this.options.cellView, null, b, null, "target") || this.$(".fork").hide(), b.remove(), a = null
    },
    makeLoopLink: function(a) {
        var b, c, d = this.options.loopLinkWidth,
            e = this.options.paper.options,
            f = g.rect({
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
                        e = g.point(h.x + h.width / 2, h.y - d), i = d / 2;
                        break;
                    case "bottom":
                        e = g.point(h.x + h.width / 2, h.y + h.height + d), i = d / 2;
                        break;
                    case "left":
                        e = g.point(h.x - d, h.y + h.height / 2), j = d / 2;
                        break;
                    case "right":
                        e = g.point(h.x + h.width + d, h.y + h.height / 2), j = d / 2
                }
                return b = g.point(e).offset(-i, -j), c = g.point(e).offset(i, j), f.containsPoint(b) && f.containsPoint(c)
            }, this);
        j && a.set("vertices", [b, c])
    },
    renderMagnets: function() {
        this._magnets = [];
        var a = this.$(".link"),
            b = this.options.cellView.$('[magnet="true"]');
        if (this.options.magnetFilter && (b = _.isFunction(this.options.magnetFilter) ? _.filter(b, this.options.magnetFilter) : b.filter(this.options.magnetFilter)), a.length && b.length) {
            var c = a.width(),
                d = a.height();
            _.each(b, function(b) {
                var e = b.getBoundingClientRect(),
                    f = a.clone().addClass("halo-magnet").css({
                        width: Math.min(e.width, c),
                        height: Math.min(e.height, d),
                        "background-size": "contain"
                    }).data("selector", this.options.cellView.getSelector(b)).appendTo(this.$el);
                this._magnets.push({
                    $halo: f,
                    el: b
                })
            }, this)
        }
        "false" == this.options.cellView.$el.attr("magnet") && (a.hide(), this.$(".fork").hide())
    },
    updateMagnets: function() {
        if (this._magnets.length) {
            var a = this.el.getBoundingClientRect();
            _.each(this._magnets, function(b) {
                var c = b.el.getBoundingClientRect();
                b.$halo.css({
                    left: c.left - a.left + (c.width - b.$halo.width()) / 2,
                    top: c.top - a.top + (c.height - b.$halo.height()) / 2
                })
            }, this)
        }
    }
}, {
    clear: function(a) {
        a.trigger("halo:create")
    }
});
