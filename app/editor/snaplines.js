const SNAP_DISTANCE = 10;

export default class Snaplines {
	paper = null;
	verticalEl = null;
	horizontalEl = null;
	#enabled = true;

	constructor({ paper }) {
		this.paper = paper;
		const doc = paper.el.ownerDocument;
		this.verticalEl = doc.createElement('div');
		this.verticalEl.className = 'brmw-snapline brmw-snapline-vertical';
		this.verticalEl.hidden = true;
		this.horizontalEl = doc.createElement('div');
		this.horizontalEl.className = 'brmw-snapline brmw-snapline-horizontal';
		this.horizontalEl.hidden = true;
		paper.el.appendChild(this.verticalEl);
		paper.el.appendChild(this.horizontalEl);

		paper.on('element:pointermove', (elementView) => this.#onElementDrag(elementView), this);
		paper.on('element:pointerup', () => this.#hide(), this);
	}

	enable() {
		this.#enabled = true;
	}

	disable() {
		this.#enabled = false;
		this.#hide();
	}

	#onElementDrag(elementView) {
		if (!this.#enabled) return;
		const element = elementView.model;
		const bbox = element.getBBox();
		const excluded = new Set([
			element.id,
			...element.getEmbeddedCells({ deep: true }).map((cell) => cell.id)
		]);

		let bestX = null;
		let bestY = null;
		this.paper.model.getElements().forEach((other) => {
			if (excluded.has(other.id)) return;
			const otherBBox = other.getBBox();
			bestX = this.#bestSnap(bestX, this.#axisStops(bbox, 'x', 'width'), this.#axisStops(otherBBox, 'x', 'width'));
			bestY = this.#bestSnap(bestY, this.#axisStops(bbox, 'y', 'height'), this.#axisStops(otherBBox, 'y', 'height'));
		});

		if (bestX || bestY) {
			// deep so embedded cells follow the snap, as they do on a plain drag
			element.position(
				bbox.x + (bestX?.delta ?? 0),
				bbox.y + (bestY?.delta ?? 0),
				{ deep: true }
			);
		}
		this.#showLine(this.verticalEl, bestX, 'x');
		this.#showLine(this.horizontalEl, bestY, 'y');
	}

	#axisStops(bbox, axis, dimension) {
		const start = bbox[axis];
		const size = bbox[dimension];
		return [start, start + size / 2, start + size];
	}

	#bestSnap(currentBest, draggedStops, targetStops) {
		let best = currentBest;
		draggedStops.forEach((dragged) => {
			targetStops.forEach((target) => {
				const delta = target - dragged;
				if (Math.abs(delta) > SNAP_DISTANCE) return;
				if (best && Math.abs(best.delta) <= Math.abs(delta)) return;
				best = { delta, at: target };
			});
		});
		return best;
	}

	#showLine(lineEl, snap, axis) {
		if (!snap) {
			lineEl.hidden = true;
			return;
		}
		const point = this.paper.localToPaperPoint(axis === 'x' ? { x: snap.at, y: 0 } : { x: 0, y: snap.at });
		const { width, height } = this.paper.getComputedSize();
		if (axis === 'x') {
			lineEl.style.left = `${point.x}px`;
			lineEl.style.top = '0';
			lineEl.style.height = `${height}px`;
		} else {
			lineEl.style.top = `${point.y}px`;
			lineEl.style.left = '0';
			lineEl.style.width = `${width}px`;
		}
		lineEl.hidden = false;
	}

	#hide() {
		this.verticalEl.hidden = true;
		this.horizontalEl.hidden = true;
	}
};
