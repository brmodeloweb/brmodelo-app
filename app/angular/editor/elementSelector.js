import $ from "jquery";
import "backbone";
import * as joint from "jointjs/dist/joint";

joint.ui.ElementSelector = Backbone.View.extend({
    options: {
        paper: undefined,
        graph: undefined,
        boxContent: function(a) {},
        useModelGeometry: false
    },
    className: "selection",
    events: {
        "mousedown .selection-box": "startVisualSelection",
        "touchstart .selection-box": "startVisualSelection",
    },
	initialize(a) {
		this.options = { ...this.options, ...a } || {};

		this.options = {
            ...a.paper.model,
            ...this.options,
            graph: a.paper.model,
			copyContext: {
				clones: [],
				event: null
			}
		};

		this.start = this.start.bind(this);
		this.stop = this.stop.bind(this);
		this.adjust = this.adjust.bind(this);
		this.pointerup = this.pointerup.bind(this);
		this.deleteAll = this.deleteAll.bind(this);
		this.copyAll = this.copyAll.bind(this);
		this.pasteAll = this.pasteAll.bind(this);
		this.cancel = this.cancel.bind(this);
		this.getSelectedElements = this.getSelectedElements.bind(this);

		$(document.body).on("mousemove.selectionView touchmove.selectionView", this.adjust);
		$(document).on("mouseup.selectionView touchend.selectionView", this.pointerup);

		this.listenTo(this.options.graph, "reset", this.cancel);
		this.listenTo(this.options.graph, "remove change", (a, b) => b[`selectionView_${this.cid}`]);

		this.options.paper.$el.append(this.$el);
		this._boxCount = 0;
		this.$selectionWrapper = this.createBoxWrapper();
	},
	startVisualSelection(event) {
		event.stopPropagation();

		const normalizedEvent = joint.util.normalizeEvent(event);
		const { clientX, clientY } = normalizedEvent;

		this._action = "translating";
		this.options.graph.trigger("batch:start");

		const snappedPoint = this.options.paper.snapToGrid(joint.g.point(clientX, clientY));
		this._snappedClientX = snappedPoint.x;
		this._snappedClientY = snappedPoint.y;

		this.trigger("selection-box:pointerdown", normalizedEvent);
	},
	deleteAll: function() {
		if(this.model.length > 0) {
			this.options.graph.trigger("batch:start");
			this.model.forEach(model => model.remove());
			this.options.graph.trigger("batch:stop");
			this.cancel();
		}
	},
	copyAll: function() {
		if(this.model.length > 0) {
			this.options.copyContext.clones = this.options.graph.cloneSubgraph(this.model.models, {
				deep: true,
			});
		}
	},
	setCopyContext: function (event) {
		if(event.type === "mousedown") {
			const normalizedEvent = joint.util.normalizeEvent(event);
			let localPoint = this.options.paper.clientToLocalPoint({ x: normalizedEvent.clientX, y: normalizedEvent.clientY });
			this.options.copyContext.event = {
				"x": localPoint.x,
				"y": localPoint.y
			}
		}
	},
	pasteAll: function() {
		const options = Object.assign({}, this.defaults, options);
		const graph = this.options.graph;
		const pastePoint = this.options.copyContext.event;
		const copiedCells = this.options.copyContext.clones;
		const origin = this.findbBox(Object.values(copiedCells));
		if (origin) {
			const originX = origin.x == 0 ? pastePoint.x : (pastePoint.x - origin.x);
			const originY = origin.y == 0 ? pastePoint.y : (pastePoint.y - origin.y);
			const translation = {
				dx: originX,
				dy: originY
			};
			options.translate = translation;
			let zIndex = graph.maxZIndex();
			const context = this;
			const modifiedCells = Object.values(copiedCells).map(cell => {
				return context.moveCell(cell, options, zIndex += 1);
			});
			graph.startBatch("paste");
			graph.addCells(modifiedCells);
			graph.stopBatch("paste");
			this.options.copyContext = {
				clones: [],
				event: null
			}
		}
	},
	findbBox: function(cells, opt){
		return joint.util.toArray(cells).reduce(function(memo, cell) {
			if (cell.isLink()) return memo;
			let rect = cell.getBBox(opt);
			const angle = cell.angle();
			if (angle) rect = rect.bbox(angle);
			if (memo) {
				return memo.union(rect);
			} else {
				return rect;
			}
		}, null);
	},
	moveCell: function(cell, options, zIndex) {
		cell.set("z", zIndex);
		if (cell.isLink() && options.link) {
			cell.set(options.link);
		}
		if (options.translate) {
			const { dx, dy } = options.translate;
			cell.translate(Number.isFinite(dx) ? dx : 0, Number.isFinite(dy) ? dy : 0);
		}
		cell.collection = null;
		return cell;
	},
    start: function(event) {
		const normalizedEvent = joint.util.normalizeEvent(event);
		this.cancel();
		this._action = "selecting";
		this._clientX = normalizedEvent.clientX;
		this._clientY = normalizedEvent.clientY;
		const targetElement = normalizedEvent.target.parentElement || normalizedEvent.target.parentNode;
		const targetOffset = $(targetElement).offset();
		const targetScrollLeft = targetElement.scrollLeft;
		const targetScrollTop = targetElement.scrollTop;
		this._offsetX = (normalizedEvent.offsetX === undefined)
			? normalizedEvent.clientX - targetOffset.left + window.pageXOffset + targetScrollLeft
			: normalizedEvent.offsetX;
		this._offsetY = (normalizedEvent.offsetY === undefined)
			? normalizedEvent.clientY - targetOffset.top + window.pageYOffset + targetScrollTop
			: normalizedEvent.offsetY;
		this.$el.css({
			width: 1,
			height: 1,
			left: this._offsetX,
			top: this._offsetY
		}).show();
    },
	adjust: function(event) {
		if (!this._action) return;
		const normalizedEvent = joint.util.normalizeEvent(event);
		const { clientX, clientY } = normalizedEvent;
		let deltaX, deltaY;
		switch (this._action) {
			case "selecting":
                deltaX = clientX - this._clientX;
                deltaY = clientY - this._clientY;
				const currentLeft = parseInt(this.$el.css("left"), 10);
				const currentTop = parseInt(this.$el.css("top"), 10);
				this.$el.css({
					left: deltaX < 0 ? this._offsetX + deltaX : currentLeft,
					top: deltaY < 0 ? this._offsetY + deltaY : currentTop,
					width: Math.abs(deltaX),
					height: Math.abs(deltaY)
				});
				break;
			case "translating":
				const snappedPoint = this.options.paper.snapToGrid(joint.g.point(normalizedEvent.clientX, normalizedEvent.clientY));
				const snappedX = snappedPoint.x;
				const snappedY = snappedPoint.y;
				deltaX = snappedX - this._snappedClientX;
				deltaY = snappedY - this._snappedClientY;
				if (deltaX || deltaY) {
					const translatedCells = new Set();
					this.model.each(cell => {
						if (!translatedCells.has(cell.id)) {
							const translationOptions = { [`selectionView_${this.cid}`]: true };
							cell.translate(deltaX, deltaY, translationOptions);
							cell.getEmbeddedCells({ deep: true }).forEach(embeddedCell => {
								translatedCells.add(embeddedCell.id);
							});
							const connectedLinks = this.options.graph.getConnectedLinks(cell);
							connectedLinks.forEach(link => {
								if (!translatedCells.has(link.id)) {
									link.translate(deltaX, deltaY, translationOptions);
									translatedCells.add(link.id);
								}
							});
						}
					}, this);
					if (!this.boxesUpdated) {
						const scale = joint.V(this.options.paper.viewport).scale();
						this.$el.children(".selection-box").add(this.$selectionWrapper).css({
							left: `+=${deltaX * scale.sx}`,
							top: `+=${deltaY * scale.sy}`
						});
					}
					this._snappedClientX = snappedX;
					this._snappedClientY = snappedY;
				}
				this.trigger("selection-box:pointermove", normalizedEvent);
				break;
			default:
				if (this._action) {
					this.pointermove(normalizedEvent);
				}
		}
		this.boxesUpdated = false;
	},
	stop: function(event) {
		switch (this._action) {
			case "selecting":
				const $elOffset = this.$el.offset();
				const $elWidth = this.$el.width();
				const $elHeight = this.$el.height();
				const paper = this.options.paper;
				const localPoint = joint.V(paper.viewport).toLocalPoint($elOffset.left, $elOffset.top);
				localPoint.x -= window.pageXOffset;
				localPoint.y -= window.pageYOffset;
				const scale = joint.V(paper.viewport).scale();
				const scaledWidth = $elWidth / scale.sx;
				const scaledHeight = $elHeight / scale.sy;
				const selectionRect = joint.g.rect(localPoint.x, localPoint.y, scaledWidth, scaledHeight);
				const selectedViews = this.options.useModelGeometry
					? paper.model.findModelsInArea(selectionRect).map(model => paper.findViewByModel(model)).filter(Boolean)
					: paper.findViewsInArea(selectionRect);
				const filter = this.options.filter;
				if (Array.isArray(filter)) {
					selectedViews = selectedViews.filter(view => !filter.includes(view.model) && !filter.includes(view.model.get("type")));
				} else if (typeof filter === "function") {
					selectedViews = selectedViews.filter(view => !filter(view.model));
				}
				this.model.reset(selectedViews.map(view => view.model), { ui: true });
				if (selectedViews.length) {
					selectedViews.forEach(this.createBox, this);
					this.$el.addClass("selected");
				} else {
					this.$el.hide();
				}
				break;
			case "translating":
				this.options.graph.trigger("batch:stop");
				this.trigger("selection-box:pointerup", event);
				break;
			default:
				if (!this._action) {
					this.cancel();
				}
		}
		delete this._action;
	},
    pointerup: function(a) {
        this._action && (this.triggerAction(this._action, "pointerup", a), this.stop(), delete this._action)
    },
    cancel: function() {
        this.destroyBoxes();
		this.model.reset([], {
            ui: !0
        })
    },
    destroyBoxes: function() {
        this.$el.hide().children(".selection-box").remove();
		this.$el.removeClass("selected");
		this._boxCount = 0;
		this.updateBoxWrapper();
    },
	createBox(a) {
		const bbox = a.getBBox({ useModelGeometry: this.options.useModelGeometry });
		const c = $("<div/>", {
			class: "selection-box",
			"data-model": a.model.get("id")
		});
		c.css({
			left: bbox.x,
			top: bbox.y,
			width: bbox.width,
			height: bbox.height
		});
		this.$el.append(c);
		this.$el.addClass("selected").show();
		this._boxCount++;
		this.updateBoxWrapper();
	},
    createBoxWrapper: function() {
		const boxWrapper = $("<div/>", {
				"class": "selection-wrapper"
			});
		const box = $("<div/>", {
				"class": "box"
			});
		boxWrapper.append(box);
		boxWrapper.attr("data-selection-length", this.model.length);
		this.$el.prepend(boxWrapper);
		return boxWrapper;
    },
	updateBoxWrapper() {
		const initialCoords = { x: Infinity, y: Infinity };
		const finalCoords = { x: 0, y: 0 };
		this.model.each(c => {
			const view = this.options.paper.findViewByModel(c);
			if (view) {
				const bbox = view.getBBox({ useModelGeometry: this.options.useModelGeometry });
				initialCoords.x = Math.min(initialCoords.x, bbox.x);
				initialCoords.y = Math.min(initialCoords.y, bbox.y);
				finalCoords.x = Math.max(finalCoords.x, bbox.x + bbox.width);
				finalCoords.y = Math.max(finalCoords.y, bbox.y + bbox.height);
			}
		}, this);
		const { x: left, y: top } = initialCoords;
		const width = finalCoords.x - left;
		const height = finalCoords.y - top;
		this.$selectionWrapper.css({
			left,
			top,
			width,
			height
		}).attr("data-selection-length", this.model.length);
		if (typeof this.options.boxContent === "function") {
			const boxElement = this.$(".box");
			const boxContent = this.options.boxContent.call(this, boxElement[0]);
			if (boxContent) {
				boxElement.html(boxContent);
			}
		}
	},
	pointermove(event) {
		if (!this._action) return;

		const { clientX, clientY } = event;
		const currentSnap = this.options.paper.snapToGrid({ x: clientX, y: clientY });
		const prevSnap = this.options.paper.snapToGrid({ x: this._clientX, y: this._clientY });

		const d = currentSnap.x - prevSnap.x;
		const e = currentSnap.y - prevSnap.y;

		const deltaX = clientX - this._startClientX;
		const deltaY = clientY - this._startClientY;

		this.triggerAction(this._action, "pointermove", event, d, e, deltaX, deltaY);

		this._clientX = clientX;
		this._clientY = clientY;
	},
    triggerAction: function(a, b) {
        var d = Array.prototype.slice.call(arguments, 2);
        d.unshift("action:" + a + ":" + b);
		this.trigger.apply(this, d);
    },
	getSelectedElements: function() {
		return this.model.models;
	}
});