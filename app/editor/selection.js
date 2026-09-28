import { mvc } from '@joint/core';

const BOX_PADDING = 4;

export default class Selection {
	collection = new mvc.Collection();
	paper = null;
	graph = null;
	el = null;
	wrapperEl = null;
	removeButtonEl = null;
	#boxes = new Map();

	constructor({ paper }) {
		this.paper = paper;
		this.graph = paper.model;

		const doc = paper.el.ownerDocument;
		this.el = doc.createElement('div');
		this.el.className = 'brmw-selection';
		this.removeButtonEl = doc.createElement('button');
		this.removeButtonEl.className = 'brmw-selection-remove';
		this.removeButtonEl.setAttribute('type', 'button');
		this.removeButtonEl.addEventListener('pointerdown', (evt) => {
			evt.stopPropagation();
			this.#removeSelectedElements();
		});
		this.wrapperEl = doc.createElement('div');
		this.wrapperEl.className = 'brmw-selection-wrapper';
		this.el.appendChild(this.wrapperEl);
		this.el.appendChild(this.removeButtonEl);
		paper.el.appendChild(this.el);

		this.collection.on('add remove reset', () => this.#render());
		this.graph.on('change:position', (element, position, opt) => this.#onElementMove(element, position, opt));
		this.graph.on('change:size', (element) => {
			if (this.collection.get(element)) this.#render();
		});
		this.graph.on('remove', (cell) => this.collection.remove(cell));
		this.paper.on('scale translate resize', () => this.#render());

		this.#render();
	}

	startSelecting(evt) {
		const doc = this.paper.el.ownerDocument;
		const origin = { x: evt.clientX, y: evt.clientY };
		const lassoEl = doc.createElement('div');
		lassoEl.className = 'brmw-selection-lasso';
		this.paper.el.appendChild(lassoEl);

		const updateLasso = (clientX, clientY) => {
			const paperBounds = this.paper.el.getBoundingClientRect();
			lassoEl.style.left = `${Math.min(origin.x, clientX) - paperBounds.left}px`;
			lassoEl.style.top = `${Math.min(origin.y, clientY) - paperBounds.top}px`;
			lassoEl.style.width = `${Math.abs(clientX - origin.x)}px`;
			lassoEl.style.height = `${Math.abs(clientY - origin.y)}px`;
		};
		updateLasso(origin.x, origin.y);

		const stopTracking = () => {
			doc.removeEventListener('pointermove', onMove);
			doc.removeEventListener('pointerup', onUp);
			doc.removeEventListener('pointercancel', onCancel);
			lassoEl.remove();
		};
		const onMove = (moveEvt) => updateLasso(moveEvt.clientX, moveEvt.clientY);
		const onCancel = () => stopTracking();
		const onUp = (upEvt) => {
			stopTracking();

			const from = this.paper.clientToLocalPoint(origin);
			const to = this.paper.clientToLocalPoint({ x: upEvt.clientX, y: upEvt.clientY });
			const area = {
				x: Math.min(from.x, to.x),
				y: Math.min(from.y, to.y),
				width: Math.abs(to.x - from.x),
				height: Math.abs(to.y - from.y)
			};
			if (area.width < 2 && area.height < 2) return;
			this.collection.reset(this.graph.findElementsInArea(area));
		};
		doc.addEventListener('pointermove', onMove);
		doc.addEventListener('pointerup', onUp);
		doc.addEventListener('pointercancel', onCancel);
	}

	#removeSelectedElements() {
		const models = [...this.collection.models];
		this.collection.reset([]);
		this.graph.removeCells(models);
	}

	#onElementMove(element, position, opt) {
		if (!this.collection.get(element)) return;
		// Sibling translations are rendered once by the initiating element's handler
		if (opt.selectionTranslate) return;
		// translateBy set to another id means this move cascaded from an embedding
		// parent; commandManager marks undo/redo replays, which must not cascade
		// onto elements that were not part of the undone command
		const cascaded = opt.translateBy && opt.translateBy !== element.id;
		if (!cascaded && !opt.commandManager) {
			const selectedIds = new Set(this.collection.map((model) => model.id));
			const hasSelectedAncestor = (cell) =>
				cell.getAncestors().some((ancestor) => selectedIds.has(ancestor.id));
			// A dragged element whose ancestor is also selected must not cascade:
			// translating the ancestor would move the element a second time
			if (!hasSelectedAncestor(element)) {
				const previous = element.previous('position');
				const dx = position.x - previous.x;
				const dy = position.y - previous.y;
				this.collection.each((other) => {
					if (other === element) return;
					if (hasSelectedAncestor(other)) return;
					other.translate(dx, dy, { selectionTranslate: true });
				});
			}
		}
		this.#render();
	}

	#render() {
		const doc = this.paper.el.ownerDocument;
		const seen = new Set();
		let union = null;

		this.collection.each((model) => {
			seen.add(model.id);
			// The rendered view bbox covers shapes that paint outside the model
			// bbox (erd.Attribute/Key) and already comes in paper coordinates
			const view = model.findView(this.paper);
			const { x, y, width, height } = view
				? view.getBBox()
				: this.paper.localToPaperRect(model.getBBox());
			const rect = {
				x: x - BOX_PADDING,
				y: y - BOX_PADDING,
				width: width + BOX_PADDING * 2,
				height: height + BOX_PADDING * 2
			};

			let boxEl = this.#boxes.get(model.id);
			if (!boxEl) {
				boxEl = doc.createElement('div');
				boxEl.className = 'brmw-selection-box';
				this.el.appendChild(boxEl);
				this.#boxes.set(model.id, boxEl);
			}
			boxEl.style.left = `${rect.x}px`;
			boxEl.style.top = `${rect.y}px`;
			boxEl.style.width = `${rect.width}px`;
			boxEl.style.height = `${rect.height}px`;

			union = union == null ? rect : {
				x: Math.min(union.x, rect.x),
				y: Math.min(union.y, rect.y),
				width: Math.max(union.x + union.width, rect.x + rect.width) - Math.min(union.x, rect.x),
				height: Math.max(union.y + union.height, rect.y + rect.height) - Math.min(union.y, rect.y)
			};
		});

		for (const [id, boxEl] of this.#boxes) {
			if (!seen.has(id)) {
				boxEl.remove();
				this.#boxes.delete(id);
			}
		}

		this.el.hidden = union == null;
		if (union) {
			this.wrapperEl.style.left = `${union.x}px`;
			this.wrapperEl.style.top = `${union.y}px`;
			this.wrapperEl.style.width = `${union.width}px`;
			this.wrapperEl.style.height = `${union.height}px`;
			this.removeButtonEl.style.left = `${union.x}px`;
			this.removeButtonEl.style.top = `${union.y}px`;
		}
	}
};
