import $ from "jquery";
import _ from "underscore";
import "backbone";
import * as joint from "jointjs";

var Handlebars = {};
! function (a, b) {
    a.VERSION = "1.0.0", a.COMPILER_REVISION = 4, a.REVISION_CHANGES = {
        1: "<= 1.0.rc.2",
        2: "== 1.0.0-rc.3",
        3: "== 1.0.0-rc.4",
        4: ">= 1.0.0"
    }, a.helpers = {}, a.partials = {};
    var c = Object.prototype.toString,
        d = "[object Function]",
        e = "[object Object]";
    a.registerHelper = function (b, d, f) {
        if (c.call(b) === e) {
            if (f || d) throw new a.Exception("Arg not supported with multiple helpers");
            a.Utils.extend(this.helpers, b)
        } else f && (d.not = f), this.helpers[b] = d
    }, a.registerPartial = function (b, d) {
        c.call(b) === e ? a.Utils.extend(this.partials, b) : this.partials[b] = d
    }, a.registerHelper("helperMissing", function (a) {
        if (2 === arguments.length) return b;
        throw new Error("Missing helper: '" + a + "'")
    }), a.registerHelper("blockHelperMissing", function (b, e) {
        var f = e.inverse || function () { }, g = e.fn,
            h = c.call(b);
        return h === d && (b = b.call(this)), b === !0 ? g(this) : b === !1 || null == b ? f(this) : "[object Array]" === h ? b.length > 0 ? a.helpers.each(b, e) : f(this) : g(b)
    }), a.K = function () { }, a.createFrame = Object.create || function (b) {
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
        log: function (b, c) {
            if (a.logger.level <= b) {
                var d = a.logger.methodMap[b];
                "undefined" != typeof console && console[d] && console[d].call(console, c)
            }
        }
    }, a.log = function (b, c) {
        a.logger.log(b, c)
    }, a.registerHelper("each", function (b, e) {
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
    }), a.registerHelper("if", function (b, e) {
        var f = c.call(b);
        return f === d && (b = b.call(this)), !b || a.Utils.isEmpty(b) ? e.inverse(this) : e.fn(this)
    }), a.registerHelper("unless", function (b, c) {
        return a.helpers["if"].call(this, b, {
            fn: c.inverse,
            inverse: c.fn
        })
    }), a.registerHelper("with", function (b, e) {
        var f = c.call(b);
        return f === d && (b = b.call(this)), a.Utils.isEmpty(b) ? void 0 : e.fn(b)
    }), a.registerHelper("log", function (b, c) {
        var d = c.data && null != c.data.level ? parseInt(c.data.level, 10) : 1;
        a.log(d, b)
    });
    var f = ["description", "fileName", "lineNumber", "message", "name", "number", "stack"];
    a.Exception = function () {
        for (var a = Error.prototype.constructor.apply(this, arguments), b = 0; b < f.length; b++) this[f[b]] = a[f[b]]
    }, a.Exception.prototype = new Error, a.SafeString = function (a) {
        this.string = a
    }, a.SafeString.prototype.toString = function () {
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
        j = function (a) {
            return g[a] || "&amp;"
        };
    a.Utils = {
        extend: function (a, b) {
            for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c])
        },
        escapeExpression: function (b) {
            return b instanceof a.SafeString ? b.toString() : null == b || b === !1 ? "" : (b = b.toString(), i.test(b) ? b.replace(h, j) : b)
        },
        isEmpty: function (a) {
            return a || 0 === a ? "[object Array]" === c.call(a) && 0 === a.length ? !0 : !1 : !0
        }
    }, a.VM = {
        template: function (b) {
            var c = {
                escapeExpression: a.Utils.escapeExpression,
                invokePartial: a.VM.invokePartial,
                programs: [],
                program: function (b, c, d) {
                    var e = this.programs[b];
                    return d ? e = a.VM.program(b, c, d) : e || (e = this.programs[b] = a.VM.program(b, c)), e
                },
                merge: function (b, c) {
                    var d = b || c;
                    return b && c && (d = {}, a.Utils.extend(d, c), a.Utils.extend(d, b)), d
                },
                programWithDepth: a.VM.programWithDepth,
                noop: a.VM.noop,
                compilerInfo: null
            };
            return function (d, e) {
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
        programWithDepth: function (a, b, c) {
            var d = Array.prototype.slice.call(arguments, 3),
                e = function (a, e) {
                    return e = e || {}, b.apply(this, [a, e.data || c].concat(d))
                };
            return e.program = a, e.depth = d.length, e
        },
        program: function (a, b, c) {
            var d = function (a, d) {
                return d = d || {}, b(a, d.data || c)
            };
            return d.program = a, d.depth = 0, d
        },
        noop: function () {
            return ""
        },
        invokePartial: function (c, d, e, f, g, h) {
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
}(Handlebars), 
    joint.templates = joint.templates || {}, 
    joint.templates.stencil = joint.templates.stencil || {}, 
    joint.templates.stencil["elements.html"] = Handlebars.template(function (a, b, c, d, e) {
        return this.compilerInfo = [4, ">= 1.0.0"], c = this.merge(c, a.helpers), e = e || {}, '<div class="elements"></div>\n'
    }), 
    joint.templates.stencil["group.html"] = Handlebars.template(function (a, b, c, d, e) {
    this.compilerInfo = [4, ">= 1.0.0"], c = this.merge(c, a.helpers), e = e || {};
    var f, g = "",
        h = "function",
        i = this.escapeExpression;
    return g += '<div class="group">\n    <h3 class="group-label">', (f = c.label) ? f = f.call(b, {
        hash: {},
        data: e
    }) : (f = b.label, f = typeof f === h ? f.apply(b) : f), g += i(f) + "</h3>\n</div>\n"
}), joint.templates.stencil["search.html"] = Handlebars.template(function (a, b, c, d, e) {
    return this.compilerInfo = [4, ">= 1.0.0"], c = this.merge(c, a.helpers), e = e || {}, '<input class="search" type="search" placeholder="search"/>\n'
}), joint.templates.stencil["stencil.html"] = Handlebars.template(function (a, b, c, d, e) {
    return this.compilerInfo = [4, ">= 1.0.0"], c = this.merge(c, a.helpers), e = e || {}, '<div class="stencil-paper-drag"></div>\n<div class="content"></div>\n\n'
}), joint.ui.Stencil = Backbone.View.extend({
    className: "stencil",
    events: {
        "click .group-label": "onGroupLabelClick",
        "touchstart .group-label": "onGroupLabelClick",
        "input .search": "onSearch"
    },
    options: {
        width: 126,
        height: 500
    },
    initialize: function (a) {
        this.options = _.extend({}, _.result(this, "options"), a || {}), 
        this.graphs = {}, 
        this.papers = {}, 
        this.$groups = {}, 
        _.bindAll(this, "onDrag", "onDragEnd"), 
        $(document.body).on({
            "mousemove.stencil touchmove.stencil": this.onDrag,
            "mouseup.stencil touchend.stencil": this.onDragEnd
        }), 
        this.onSearch = _.debounce(this.onSearch, 126)
    },
    render: function () {
        this.$el.html(joint.templates.stencil["stencil.html"](this.template)); 
        this.$content = this.$(".content");
        this.options.search && this.$el.addClass("searchable").prepend(joint.templates.stencil["search.html"]());
        var a = {
            width: this.options.width,
            height: this.options.height,
            interactive: !1
        };
        if (this.options.groups) {
            var b = _.sortBy(_.pairs(this.options.groups), function (a) {
                return a[1].index
            });
            _.each(b, function (b) {
                var c = b[0],
                    d = b[1],
                    e = $(joint.templates.stencil["group.html"]({
                        label: d.label || c
                    }));
                e.attr("data-name", c), d.closed && e.addClass("closed"), e.append($(joint.templates.stencil["elements.html"]())), this.$content.append(e), this.$groups[c] = e;
                var f = new joint.dia.Graph;
                this.graphs[c] = f;
                var g = new joint.dia.Paper(_.extend({}, a, {
                    el: e.find(".elements"),
                    model: f,
                    width: d.width || a.width,
                    height: d.height || a.height
                }));
                this.papers[c] = g
            }, this)
        } else {
            this.$content.append($(joint.templates.stencil["elements.html"]()));
            var c = new joint.dia.Graph;
            this.graphs.__default__ = c;
            var d = new joint.dia.Paper(_.extend(a, {
                el: this.$(".elements"),
                model: c
            }));
            this.papers.__default__ = d
        }

        this._graphDrag = new joint.dia.Graph, this._paperDrag = new joint.dia.Paper({
            el: this.$(".stencil-paper-drag"),
            width: 1,
            height: 1,
            model: this._graphDrag
        });

        const ctrl = this;

        _.each(this.papers, function (a) {
            this.listenTo(a, "cell:pointerdown", this.onDragStart)
        }, this)

        return this;

    },
    load: function (a, b) {
        var c = this.graphs[b || "__default__"];
        if (!c) throw new Error("Stencil: group " + b + " does not exist.");
        c.resetCells(a);
        var d = this.options.height;
        b && this.options.groups[b] && (d = this.options.groups[b].height), d || this.papers[b || "__default__"].fitToContent(1, 1, this.options.paperPadding || 10)
    },
    getGraph: function (a) {
        return this.graphs[a || "__default__"]
    },
    getPaper: function (a) {
        return this.papers[a || "__default__"]
    },
    onDragStart: function (a, b) {
        this.$el.addClass("dragging"), this._paperDrag.$el.addClass("dragging"), $(document.body).append(this._paperDrag.$el), this._clone = a.model.clone(), this._cloneBbox = a.getBBox();
        var c = 5;
        var d = joint.g.point(this._cloneBbox.x - this._clone.get("position").x, this._cloneBbox.y - this._clone.get("position").y);
        this._clone.set("position", {
            x: -d.x + c,
            y: -d.y + c
        }), this._graphDrag.addCell(this._clone), this._paperDrag.setDimensions(this._cloneBbox.width + 2 * c, this._cloneBbox.height + 2 * c);
        var e = document.body.scrollTop || document.documentElement.scrollTop;
        this._paperDrag.$el.offset({
            left: b.clientX - this._cloneBbox.width / 2,
            top: b.clientY + e - this._cloneBbox.height / 2
        })
    },
    onDrag: function (a) {
        if (a = joint.util.normalizeEvent(a), this._clone) {
            var b = document.body.scrollTop || document.documentElement.scrollTop;
            this._paperDrag.$el.offset({
                left: a.clientX - this._cloneBbox.width / 2,
                top: a.clientY + b - this._cloneBbox.height / 2
            })
        }
    },
    onDragEnd: function (a) {
        a = joint.util.normalizeEvent(a), this._clone && this._cloneBbox && (this.drop(a, this._clone.clone(), this._cloneBbox), this.$el.append(this._paperDrag.$el), this.$el.removeClass("dragging"), this._paperDrag.$el.removeClass("dragging"), this._clone.remove(), this._clone = void 0)
    },
    drop: function (a, b, c) {
        var d = this.options.paper,
            e = this.options.graph,
            f = d.$el.offset(),
            h = document.body.scrollTop || document.documentElement.scrollTop,
            i = document.body.scrollLeft || document.documentElement.scrollLeft,
            j = joint.g.rect(f.left + parseInt(d.$el.css("border-left-width"), 10) - i, f.top + parseInt(d.$el.css("border-top-width"), 10) - h, d.$el.innerWidth(), d.$el.innerHeight()),
            k = d.svg.createSVGPoint();
        if (k.x = a.clientX, k.y = a.clientY, j.containsPoint(k)) {
            var l = joint.V("rect", {
                width: d.options.width,
                height: d.options.height,
                x: 0,
                y: 0,
                opacity: 0
            });
            joint.V(d.svg).prepend(l);
            var m = $(d.svg).offset();
            l.remove(), k.x += i - m.left, k.y += h - m.top;
            var n = k.matrixTransform(d.viewport.getCTM().inverse()),
                o = b.getBBox();
            n.x += o.x - c.width / 2, n.y += o.y - c.height / 2, b.set("position", {
                x: joint.g.snapToGrid(n.x, d.options.gridSize),
                y: joint.g.snapToGrid(n.y, d.options.gridSize)
            }), b.unset("z"), e.addCell(b, {
                stencil: this.cid
            })
        }
    },
    filter: function (a, b) {
        var c = a.toLowerCase() == a,
            d = _.reduce(this.papers, function (d, e, f) {
                var g = e.model.get("cells").filter(function (d) {
                    var f = e.findViewByModel(d),
                        g = !a || _.some(b, function (b, e) {
                            if ("*" != e && d.get("type") != e) return !1;
                            var f = _.some(b, function (b) {
                                var e = joint.util.getByPath(d.attributes, b, "/");
                                return _.isUndefined(e) || _.isNull(e) ? !1 : (e = e.toString(), c && (e = e.toLowerCase()), e.indexOf(a) >= 0)
                            });
                            return f
                        });
                    return joint.V(f.el).toggleClass("unmatched", !g), g
                }, this),
                    h = !_.isEmpty(g),
                    i = (new joint.dia.Graph).resetCells(g);
                return this.trigger("filter", i, f), this.$groups[f] && this.$groups[f].toggleClass("unmatched", !h), e.fitToContent(1, 1, this.options.paperPadding || 10), d || h
            }, !1, this);
        this.$el.toggleClass("not-found", !d)
    },
    onSearch: function (a) {
        this.filter(a.target.value, this.options.search)
    },
    onGroupLabelClick: function (a) {
        a.preventDefault();
        var b = $(a.target).closest(".group");
        this.toggleGroup(b.data("name"))
    },
    toggleGroup: function (a) {
        this.$('.group[data-name="' + a + '"]').toggleClass("closed")
    },
    closeGroup: function (a) {
        this.$('.group[data-name="' + a + '"]').addClass("closed")
    },
    openGroup: function (a) {
        this.$('.group[data-name="' + a + '"]').removeClass("closed")
    },
    closeGroups: function () {
        this.$(".group").addClass("closed")
    },
    openGroups: function () {
        this.$(".group").removeClass("closed")
    },
    remove: function () {
        Backbone.View.prototype.remove.apply(this, arguments), $(document.body).off(".stencil", this.onDrag).off(".stencil", this.onDragEnd)
    }
}).bind(this);