import $ from "jquery";
import * as joint from "jointjs/dist/joint";

joint.ui.EditorScroller = Backbone.View.extend({
		className: "editor-scroller",
		events: {
			mousedown: "pointerdown",
			mousemove: "pointermove",
			touchmove: "pointermove"
		},
		options: {
			paper: undefined,
			padding: 0,
			autoResizePaper: false,
			baseWidth: undefined,
			baseHeight: undefined,
			contentOptions: undefined
		},
		initialize(configs) {
			this.startPanning = this.startPanning.bind(this);
			this.stopPanning = this.stopPanning.bind(this);
			this.pan = this.pan.bind(this);

			this.options = { ...this.options, ...configs } || {};
			const { paper } = this.options;

			const scaledPaper = joint.V(paper.viewport).scale();
			this._sx = scaledPaper.sx;
			this._sy = scaledPaper.sy;

			this.$el.append(paper.el);
			this.addPadding();

			this.listenTo(paper, "scale", this.onScale);
			this.listenTo(paper, "resize", this.onResize);

			if (this.options.baseWidth == null) {
				this.options.baseWidth = paper.options.width;
			}
			if (this.options.baseHeight == null) {
				this.options.baseHeight = paper.options.height;
			}

			if (this.options.autoResizePaper) {
				this.listenTo(paper.model, "change add remove reset", this.adjustPaper);
			}
		},
		onResize: function() {
			if(this._center) {
				this.center(this._center.x, this._center.y);
			}
		},
		onScale: function(zoomWidth, zoomHeight, offsetWidth, offsetHeight) {
			this.adjustScale(zoomWidth, zoomHeight);
			this._sx = zoomWidth;
			this._sy = zoomHeight;
			if(offsetWidth || offsetHeight) {
				this.center(offsetWidth, offsetHeight);
			}
		},
		beforePaperManipulation: function() {
			this.$el.css("visibility", "hidden");
		},
		afterPaperManipulation: function() {
			this.$el.css("visibility", "visible");
		},
		toLocalPoint: function(clientWidth, clientHeight) {
			const viewportCTM = this.options.paper.viewport.getCTM();
			clientWidth = (clientWidth + (this.el.scrollLeft - this.padding.paddingLeft - viewportCTM.e));
			clientWidth = clientWidth / viewportCTM.a;
			clientWidth = clientWidth + viewportCTM.d;
			clientHeight = clientHeight + (this.el.scrollTop - this.padding.paddingTop - viewportCTM.f);
			return joint.g.point(clientWidth, clientHeight);
		},
		adjustPaper() {
			try {
				const { clientWidth, clientHeight } = this.el;
				this._center = this.toLocalPoint(clientWidth / 2, clientHeight / 2);
				const newContentOptions = {
					gridWidth: this.options.baseWidth,
					gridHeight: this.options.baseHeight,
					allowNewOrigin: "negative",
					...this.options.contentOptions
				};
				this.options.paper.fitToContent(this.transformContentOptions(newContentOptions));
			} catch (error) {
				console.log(error);
			}
			return this;
		},
		adjustScale: function(zoomWidth, zoomHeight) {
			const paperOptions = this.options.paper.options;
			const newScaleX = zoomWidth / this._sx;
			const newScaleY = zoomHeight / this._sy;
			this.options.paper.setOrigin(paperOptions.origin.x * newScaleX, paperOptions.origin.y * newScaleY);
			this.options.paper.setDimensions(paperOptions.width * newScaleX, paperOptions.height * newScaleY);
		},
		transformContentOptions: function(gridConfigs) {
			const zoomWidth = this._sx;
			const zoomHeight = this._sy;
			if(gridConfigs.gridWidth) {
				gridConfigs.gridWidth *= zoomWidth;
			}
			if(gridConfigs.gridHeight) {
				gridConfigs.gridHeight *= zoomHeight;
			}
			if(gridConfigs.minWidth) {
				gridConfigs.minWidth *= zoomWidth;
			}
			if(gridConfigs.minHeight) {
				gridConfigs.minHeight *= zoomHeight;
			}
			if(typeof gridConfigs.padding === 'object') {
				gridConfigs.padding = {
					left: (gridConfigs.padding.left || 0) * zoomWidth,
					right: (gridConfigs.padding.right || 0) * zoomWidth,
					top: (gridConfigs.padding.top || 0) * zoomHeight,
					bottom: (gridConfigs.padding.bottom || 0) * zoomHeight
				}
			} else if(typeof gridConfigs.padding === 'number') {
				gridConfigs.padding = gridConfigs.padding * zoomWidth;
			}
			return gridConfigs;
		},
		center: function(halfWidth, halfHeight) {
			const viewportCTM = this.options.paper.viewport.getCTM();
			const svgMatrixE = -viewportCTM.e;
			const e = -viewportCTM.f;
			const paperWidth = svgMatrixE + this.options.paper.options.width;
			const paperHeight = e + this.options.paper.options.height;
			if(halfWidth == null || halfHeight == null) {
				halfWidth = (svgMatrixE + paperWidth) / 2;
				halfHeight = (e + paperHeight) / 2;
			} else {
				halfWidth *= viewportCTM.a;
				halfHeight *= viewportCTM.d;
			}
			const clientWidth = this.el.clientWidth / 2;
			const clientHeight = this.el.clientHeight / 2;
			this.el.scrollLeft = halfWidth - clientWidth + viewportCTM.e + this.padding.paddingLeft;
			this.el.scrollTop = halfHeight - clientHeight + viewportCTM.f + this.padding.paddingTop;
			return this;
		},
		centerContent: function() {
			const paperBox = joint.V(this.options.paper.viewport)
				.bbox(!0, this.options.paper.svg);
			this.center(paperBox.x + paperBox.width / 2, paperBox.y + paperBox.height / 2);
			return this;
		},
		addPadding: function(left, right, top, bottom) {
			const originalPadding = this.options.padding;
			this.padding = {
				paddingLeft: Math.round(originalPadding + (left || 0)),
				paddingTop: Math.round(originalPadding + (top || 0))
			};
			const newPadding = this.padding;
			const newMargin = {
				marginBottom: Math.round(originalPadding + (bottom || 0)),
				marginRight: Math.round(originalPadding + (right || 0))
			};
			newPadding.paddingLeft = Math.min(newPadding.paddingLeft, .9 * this.el.clientWidth);
			newPadding.paddingTop = Math.min(newPadding.paddingTop, .9 * this.el.clientHeight);
			this.$el.css(newPadding);
			this.options.paper.$el.css(newMargin);
			return this;
		},
		zoom: function(zoomOffset, zoomConfigs) {
			zoomConfigs = zoomConfigs || {};
			const point = this.toLocalPoint(this.el.clientWidth / 2, this.el.clientHeight / 2);
			let zoomOffsetX = zoomOffset;
			let zoomOffsetY = zoomOffset;
			let pointX;
			let pointY;
			if (!zoomConfigs.absolute) {
				zoomOffsetX += this._sx;
				zoomOffsetY += this._sy;
				if(zoomConfigs.grid) {
					zoomOffsetX = Math.round(f / zoomConfigs.grid) * zoomConfigs.grid;
					zoomOffsetY = Math.round(zoomOffsetY / zoomConfigs.grid) * zoomConfigs.grid;
				}
				if(zoomConfigs.max) {
					zoomOffsetX = Math.min(zoomConfigs.max, zoomOffsetX);
					zoomOffsetY = Math.min(zoomConfigs.max, zoomOffsetY);
				}
				if(zoomConfigs.min) {
					zoomOffsetX = Math.max(zoomConfigs.min, zoomOffsetX);
					zoomOffsetY = Math.max(zoomConfigs.min, zoomOffsetY);
				}
				if (zoomConfigs.ox == null || zoomConfigs.oy == null) {
					pointX = point.x,
					pointY = point.y;
				}
			}
			else {
				pointX = zoomConfigs.ox - (zoomConfigs.ox - point.x) / (zoomOffsetX / this._sx);
				pointY = zoomConfigs.oy - (zoomConfigs.oy - point.y) / (zoomOffsetY / this._sy);
			}
			zoomOffsetX = zoomOffsetX || 1;
			zoomOffsetY = zoomOffsetY || 1;
			this.beforePaperManipulation();
			this.options.paper.scale(zoomOffsetX, zoomOffsetY);
			this.center(pointX, pointY);
			this.afterPaperManipulation();
			return this;
		},
		startPanning: function(mouseEvent) {
			$('.editor-scroller').css('cursor', 'grab');
			const normalizedEvent = joint.util.normalizeEvent(mouseEvent);
			this._clientX = normalizedEvent.clientX,
			this._clientY = normalizedEvent.clientY,
			$(document.body).on({
				"mousemove.panning touchmove.panning": this.pan,
				"mouseup.panning touchend.panning": this.stopPanning
			})
		},
		pan: function (mouseEvent) {
			$('.editor-scroller').css('cursor', 'grabbing');
			const normalizedEvent = joint.util.normalizeEvent(mouseEvent);
			const neededMargeLeft = normalizedEvent.clientX - this._clientX;
			const neededMargeTop = normalizedEvent.clientY - this._clientY;
			this.el.scrollTop -= neededMargeTop;
			this.el.scrollLeft -= neededMargeLeft;
			this._clientX = normalizedEvent.clientX;
			this._clientY = normalizedEvent.clientY;
		},
		stopPanning: function() {
			$('.editor-scroller').css('cursor', 'default');
			$(document.body).off(".panning");
		},
		pointerdown: function(event) {
			if(event.target == this.el) {
				this.options.paper.pointerdown.apply(this.options.paper, arguments)
			}
		},
		pointermove: function(event) {
			if(event.target == this.el) {
				this.options.paper.pointermove.apply(this.options.paper, arguments);
			}
		}
});