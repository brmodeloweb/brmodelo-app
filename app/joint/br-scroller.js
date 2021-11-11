import $ from "jquery";
import * as joint from "jointjs";

joint.ui.PaperScroller = Backbone.View.extend({
		className: "paper-scroller",
		events: {
				mousedown: "pointerdown",
				mousemove: "pointermove",
				touchmove: "pointermove"
		},
		options: {
				paper: void 0,
				padding: 0,
				autoResizePaper: !1,
				baseWidth: void 0,
				baseHeight: void 0,
				contentOptions: void 0
		},
		initialize: function(a) {
				_.bindAll(this, "startPanning", "stopPanning", "pan"), this.options = _.extend({}, _.result(this, "options"), a || {});
				var b = this.options.paper,
						c = joint.V(b.viewport).scale();
				this._sx = c.sx, this._sy = c.sy, _.isUndefined(this.options.baseWidth) && (this.options.baseWidth = b.options.width), _.isUndefined(this.options.baseHeight) && (this.options.baseHeight = b.options.height), this.$el.append(b.el), this.addPadding(), this.listenTo(b, "scale", this.onScale), this.listenTo(b, "resize", this.onResize), this.options.autoResizePaper && this.listenTo(b.model, "change add remove reset", this.adjustPaper)
		},
		onResize: function() {
				this._center && this.center(this._center.x, this._center.y)
		},
		onScale: function(a, b, c, d) {
				this.adjustScale(a, b), this._sx = a, this._sy = b, (c || d) && this.center(c, d)
		},
		beforePaperManipulation: function() {
				this.$el.css("visibility", "hidden")
		},
		afterPaperManipulation: function() {
				this.$el.css("visibility", "visible")
		},
		toLocalPoint: function(a, b) {
				var c = this.options.paper.viewport.getCTM();
				return a += this.el.scrollLeft - this.padding.paddingLeft - c.e, a /= c.a, b += this.el.scrollTop - this.padding.paddingTop - c.f, b /= c.d, joint.g.point(a, b)
		},
		adjustPaper: function() {
				this._center = this.toLocalPoint(this.el.clientWidth / 2, this.el.clientHeight / 2);
				var a = _.extend({
						gridWidth: this.options.baseWidth,
						gridHeight: this.options.baseHeight,
						allowNewOrigin: "negative"
				}, this.options.contentOptions);
				return this.options.paper.fitToContent(this.transformContentOptions(a)), this
		},
		adjustScale: function(a, b) {
				var c = this.options.paper.options,
						d = a / this._sx,
						e = b / this._sy;
				this.options.paper.setOrigin(c.origin.x * d, c.origin.y * e), this.options.paper.setDimensions(c.width * d, c.height * e)
		},
		transformContentOptions: function(a) {
				var b = this._sx,
						c = this._sy;
				return a.gridWidth && (a.gridWidth *= b), a.gridHeight && (a.gridHeight *= c), a.minWidth && (a.minWidth *= b), a.minHeight && (a.minHeight *= c), _.isObject(a.padding) ? a.padding = {
						left: (a.padding.left || 0) * b,
						right: (a.padding.right || 0) * b,
						top: (a.padding.top || 0) * c,
						bottom: (a.padding.bottom || 0) * c
				} : _.isNumber(a.padding) && (a.padding = a.padding * b), a
		},
		center: function(a, b) {
				var c = this.options.paper.viewport.getCTM(),
						d = -c.e,
						e = -c.f,
						f = d + this.options.paper.options.width,
						g = e + this.options.paper.options.height;
				_.isUndefined(a) || _.isUndefined(b) ? (a = (d + f) / 2, b = (e + g) / 2) : (a *= c.a, b *= c.d);
				var h = this.options.padding,
						i = this.el.clientWidth / 2,
						j = this.el.clientHeight / 2,
						k = i - h - a + d,
						l = i - h + a - f,
						m = j - h - b + e,
						n = j - h + b - g;
				return this.addPadding(Math.max(k, 0), Math.max(l, 0), Math.max(m, 0), Math.max(n, 0)), this.el.scrollLeft = a - i + c.e + this.padding.paddingLeft, this.el.scrollTop = b - j + c.f + this.padding.paddingTop, this
		},
		centerContent: function() {
				var a = joint.V(this.options.paper.viewport).bbox(!0, this.options.paper.svg);
				return this.center(a.x + a.width / 2, a.y + a.height / 2), this
		},
		addPadding: function(a, b, c, d) {
				var e = this.options.padding,
						f = this.padding = {
								paddingLeft: Math.round(e + (a || 0)),
								paddingTop: Math.round(e + (c || 0))
						},
						g = {
								marginBottom: Math.round(e + (d || 0)),
								marginRight: Math.round(e + (b || 0))
						};
				return f.paddingLeft = Math.min(f.paddingLeft, .9 * this.el.clientWidth), f.paddingTop = Math.min(f.paddingTop, .9 * this.el.clientHeight), this.$el.css(f), this.options.paper.$el.css(g), this
		},
		zoom: function(a, b) {
				b = b || {};
				var c, d, e = this.toLocalPoint(this.el.clientWidth / 2, this.el.clientHeight / 2),
						f = a,
						g = a;
				if (b.absolute || (f += this._sx, g += this._sy), b.grid && (f = Math.round(f / b.grid) * b.grid, g = Math.round(g / b.grid) * b.grid), b.max && (f = Math.min(b.max, f), g = Math.min(b.max, g)), b.min && (f = Math.max(b.min, f), g = Math.max(b.min, g)), _.isUndefined(b.ox) || _.isUndefined(b.oy)) c = e.x, d = e.y;
				else {
						var h = f / this._sx,
								i = g / this._sy;
						c = b.ox - (b.ox - e.x) / h, d = b.oy - (b.oy - e.y) / i
				}
				return this.beforePaperManipulation(), this.options.paper.scale(f, g), this.center(c, d), this.afterPaperManipulation(), this
		},
		zoomToFit: function(a) {
				a = a || {};
				var b = this.options.paper,
						c = _.clone(b.options.origin);
				return a.fittingBBox = a.fittingBBox || _.extend({}, joint.g.point(c), {
						width: this.$el.width() + this.padding.paddingLeft,
						height: this.$el.height() + this.padding.paddingTop
				}), this.beforePaperManipulation(), b.scaleContentToFit(a), b.setOrigin(c.x, c.y), this.adjustPaper().centerContent(), this.afterPaperManipulation(), this
		},
		startPanning: function(a) {
				a = joint.util.normalizeEvent(a), this._clientX = a.clientX, this._clientY = a.clientY, $(document.body).on({
						"mousemove.panning touchmove.panning": this.pan,
						"mouseup.panning touchend.panning": this.stopPanning
				})
		},
		pan: function(a) {
				a = joint.util.normalizeEvent(a);
				var b = a.clientX - this._clientX,
						c = a.clientY - this._clientY;
				this.el.scrollTop -= c, this.el.scrollLeft -= b, this._clientX = a.clientX, this._clientY = a.clientY
		},
		stopPanning: function() {
				$(document.body).off(".panning")
		},
		pointerdown: function(a) {
				a.target == this.el && this.options.paper.pointerdown.apply(this.options.paper, arguments)
		},
		pointermove: function(a) {
				a.target == this.el && this.options.paper.pointermove.apply(this.options.paper, arguments)
		},
		remove: function() {
				this.stopPanning(), Backbone.View.prototype.remove.apply(this, arguments)
		}
});
