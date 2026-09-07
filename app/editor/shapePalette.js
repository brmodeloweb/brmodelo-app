import { dia } from '@joint/core';

export default class ShapePalette {
	el = null;
	graph = null;
	paper = null;
	targetPaper = null;

	constructor({ paper, width, height }) {
		this.targetPaper = paper;
		this.width = width;
		this.height = height;
	}

	render() {
		const namespace = this.targetPaper.options.cellViewNamespace;
		this.el = this.targetPaper.el.ownerDocument.createElement('div');
		this.el.className = 'brmw-shape-palette';
		this.graph = new dia.Graph({}, { cellNamespace: namespace });
		this.paper = new dia.Paper({
			width: this.width,
			height: this.height,
			model: this.graph,
			cellViewNamespace: namespace,
			interactive: false,
			background: { color: 'transparent' }
		});
		this.el.appendChild(this.paper.el);
		this.paper.on('element:pointerdown', (elementView, evt) => this.#startDrag(elementView, evt));
		return this;
	}

	load(cells) {
		this.graph.resetCells(cells);
	}

	remove() {
		this.paper.remove();
		this.el.remove();
	}

	#startDrag(elementView, evt) {
		evt.preventDefault();
		const doc = this.el.ownerDocument;
		const bounds = elementView.el.getBoundingClientRect();
		const grabOffset = {
			x: evt.clientX - bounds.left,
			y: evt.clientY - bounds.top
		};
		// Shapes like erd.Attribute paint outside the model bbox, so the drop
		// position must compensate the distance between model origin and visual origin
		const viewBBox = elementView.getBBox();
		const modelPosition = elementView.model.position();
		const modelOffset = {
			x: modelPosition.x - viewBBox.x,
			y: modelPosition.y - viewBBox.y
		};
		const previewEl = this.#createPreview(elementView, bounds, viewBBox);
		doc.body.appendChild(previewEl);

		const movePreview = (clientX, clientY) => {
			previewEl.style.transform = `translate(${clientX - grabOffset.x}px, ${clientY - grabOffset.y}px)`;
		};
		movePreview(evt.clientX, evt.clientY);

		const stopTracking = () => {
			doc.removeEventListener('pointermove', onMove);
			doc.removeEventListener('pointerup', onUp);
			doc.removeEventListener('pointercancel', onCancel);
			previewEl.remove();
		};
		const onMove = (moveEvt) => movePreview(moveEvt.clientX, moveEvt.clientY);
		const onUp = (upEvt) => {
			stopTracking();
			this.#drop(elementView.model, upEvt.clientX, upEvt.clientY, grabOffset, modelOffset);
		};
		const onCancel = () => stopTracking();
		doc.addEventListener('pointermove', onMove);
		doc.addEventListener('pointerup', onUp);
		doc.addEventListener('pointercancel', onCancel);
	}

	#createPreview(elementView, bounds, viewBBox) {
		const doc = this.el.ownerDocument;
		const previewEl = doc.createElement('div');
		previewEl.className = 'brmw-shape-palette-drag-preview';
		previewEl.style.width = `${bounds.width}px`;
		previewEl.style.height = `${bounds.height}px`;

		const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('viewBox', `${viewBBox.x} ${viewBBox.y} ${viewBBox.width} ${viewBBox.height}`);
		svg.setAttribute('width', '100%');
		svg.setAttribute('height', '100%');
		svg.style.overflow = 'visible';
		svg.appendChild(elementView.el.cloneNode(true));
		previewEl.appendChild(svg);
		return previewEl;
	}

	#drop(sourceModel, clientX, clientY, grabOffset, modelOffset) {
		const doc = this.el.ownerDocument;
		const hit = doc.elementFromPoint ? doc.elementFromPoint(clientX, clientY) : null;
		if (!hit || !this.targetPaper.el.contains(hit)) return;

		const position = this.targetPaper.clientToLocalPoint({
			x: clientX - grabOffset.x,
			y: clientY - grabOffset.y
		});
		const clone = sourceModel.clone();
		clone.position(position.x + modelOffset.x, position.y + modelOffset.y);
		this.targetPaper.model.addCell(clone);
	}
};
