const DIRECTIONS = {
	nw: 'top-left',
	n: 'top',
	ne: 'top-right',
	e: 'right',
	se: 'bottom-right',
	s: 'bottom',
	sw: 'bottom-left',
	w: 'left'
};

export default class ElementResizer {
	cellView = null;
	paper = null;
	el = null;
	minWidth = 0;
	minHeight = 0;
	#listeners = new Map();
	#removed = false;
	#activeResize = null;

	constructor({ cellView, minWidth = 50, minHeight = 30 }) {
		this.cellView = cellView;
		this.paper = cellView.paper;
		this.minWidth = minWidth;
		this.minHeight = minHeight;
	}

	on(event, callback) {
		if (!this.#listeners.has(event)) this.#listeners.set(event, []);
		this.#listeners.get(event).push(callback);
	}

	render() {
		const doc = this.paper.el.ownerDocument;
		this.el = doc.createElement('div');
		this.el.className = 'brmw-element-resizer';

		Object.keys(DIRECTIONS).forEach((handle) => {
			const handleEl = doc.createElement('div');
			handleEl.className = `brmw-element-resizer-handle brmw-element-resizer-${handle}`;
			handleEl.addEventListener('pointerdown', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				this.#startResize(handle);
			});
			this.el.appendChild(handleEl);
		});

		this.paper.el.appendChild(this.el);

		const model = this.cellView.model;
		model.on('change:position change:size', () => this.#updatePosition(), this);
		model.on('remove', () => this.remove(), this);
		this.paper.on('scale translate', () => this.#updatePosition(), this);
		this.paper.on('blank:pointerdown', () => this.remove(), this);
		this.paper.on('cell:pointerdown', (cellView) => {
			if (cellView !== this.cellView) this.remove();
		}, this);

		this.#updatePosition();
		return this;
	}

	remove() {
		if (this.#removed) return;
		this.#removed = true;
		this.#activeResize?.cancel();
		this.cellView.model.off(null, null, this);
		this.paper.off(null, null, this);
		this.el.remove();
	}

	#trigger(event, ...args) {
		(this.#listeners.get(event) ?? []).forEach((callback) => callback(...args));
	}

	#updatePosition() {
		const { x, y, width, height } = this.paper.localToPaperRect(this.cellView.model.getBBox());
		this.el.style.left = `${x}px`;
		this.el.style.top = `${y}px`;
		this.el.style.width = `${width}px`;
		this.el.style.height = `${height}px`;
	}

	#startResize(handle) {
		const doc = this.paper.el.ownerDocument;
		const model = this.cellView.model;
		const graph = this.paper.model;
		const start = model.getBBox();
		// Batch on the graph, not the cell: a cell removed mid-resize would no
		// longer reach the graph to close it, leaving the batch open forever
		graph.startBatch('resize');

		const onPointerMove = (moveEvt) => {
			const point = this.paper.clientToLocalPoint({ x: moveEvt.clientX, y: moveEvt.clientY });
			let width = start.width;
			let height = start.height;
			if (handle.includes('e')) width = point.x - start.x;
			if (handle.includes('w')) width = start.x + start.width - point.x;
			if (handle.includes('s')) height = point.y - start.y;
			if (handle.includes('n')) height = start.y + start.height - point.y;
			model.resize(
				Math.max(width, this.minWidth),
				Math.max(height, this.minHeight),
				{ direction: DIRECTIONS[handle] }
			);
		};
		const stopTracking = () => {
			doc.removeEventListener('pointermove', onPointerMove);
			doc.removeEventListener('pointerup', onPointerUp);
			doc.removeEventListener('pointercancel', onPointerUp);
			graph.stopBatch('resize');
			this.#activeResize = null;
		};
		const onPointerUp = () => {
			stopTracking();
			this.#trigger('resize:stop');
		};
		doc.addEventListener('pointermove', onPointerMove);
		doc.addEventListener('pointerup', onPointerUp);
		doc.addEventListener('pointercancel', onPointerUp);
		this.#activeResize = { cancel: stopTracking };
	}
};
