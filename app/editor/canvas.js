const DRAG_SCROLL_EDGE = 30;
const DRAG_SCROLL_MAX_STEP = 20;
const DRAG_SCROLL_INTERVAL = 16;

export default class Canvas {
	el = null;
	backgroundEl = null;
	paper = null;
	// fitToContent later mutates paper.options.width/height, so the page size
	// is snapshotted at construction
	#basePage = { width: 0, height: 0 };
	#padding = { x: 0, y: 0 };
	#rafId = null;
	#adjusting = false;
	#dragScroll = { intervalId: null, clientX: 0, clientY: 0 };
	#panListeners = null;
	#resizeObserver = null;
	#centerRetried = false;

	constructor({ paper }) {
		this.paper = paper;
		this.#basePage = { width: paper.options.width, height: paper.options.height };

		const doc = paper.el.ownerDocument;
		this.el = doc.createElement('div');
		this.el.className = 'brmw-canvas';
		this.backgroundEl = doc.createElement('div');
		this.backgroundEl.className = 'brmw-canvas-background';
		this.backgroundEl.appendChild(paper.el);
		this.el.appendChild(this.backgroundEl);

		paper.on('render:done', () => this.#requestAdjust(), this);
		paper.on('cell:pointermove', (cellView, evt) => this.#onCellDragMove(evt), this);
		paper.on('cell:pointerup', () => this.#stopDragScroll(), this);

		this.#resizeObserver = new ResizeObserver(() => this.#updatePadding());
		this.#resizeObserver.observe(this.el);
	}

	zoom(delta, opt = {}) {
		this.#updatePadding();
		const current = this.paper.scale().sx;
		let next = current + delta;
		if (opt.max !== undefined) next = Math.min(next, opt.max);
		if (opt.min !== undefined) next = Math.max(next, opt.min);
		next = Math.round(next * 100) / 100;
		if (next === current) return;

		const anchor = this.paper.clientToLocalPoint(this.#viewportCenterClient());
		this.paper.scale(next);
		this.adjustPaper();
		this.#scrollLocalPointToCenter(anchor);
	}

	center() {
		this.#updatePadding();
		if (this.el.clientWidth === 0) {
			if (this.#centerRetried) return;
			this.#centerRetried = true;
			this.el.ownerDocument.defaultView.requestAnimationFrame(() => this.center());
			return;
		}
		this.#centerRetried = false;
		// Model geometry is correct synchronously after fromJSON; the async
		// paper may not have rendered views yet at this point
		this.adjustPaper({ useModelGeometry: true });
		const { width, height } = this.paper.getComputedSize();
		this.el.scrollLeft = this.#padding.x + width / 2 - this.el.clientWidth / 2;
		this.el.scrollTop = this.#padding.y + height / 2 - this.el.clientHeight / 2;
	}

	startPanning(evt) {
		const doc = this.el.ownerDocument;
		let last = { x: evt.clientX, y: evt.clientY };
		const onMove = (moveEvt) => {
			this.el.scrollLeft -= moveEvt.clientX - last.x;
			this.el.scrollTop -= moveEvt.clientY - last.y;
			last = { x: moveEvt.clientX, y: moveEvt.clientY };
		};
		const onEnd = () => {
			doc.removeEventListener('pointermove', onMove);
			doc.removeEventListener('pointerup', onEnd);
			doc.removeEventListener('pointercancel', onEnd);
			this.#panListeners = null;
			this.el.classList.remove('is-panning');
			this.setCursor('default');
		};
		doc.addEventListener('pointermove', onMove);
		doc.addEventListener('pointerup', onEnd);
		doc.addEventListener('pointercancel', onEnd);
		this.#panListeners = { stop: onEnd };
		this.el.classList.add('is-panning');
	}

	setCursor(cursor) {
		this.el.style.cursor = cursor;
	}

	adjustPaper(opt = {}) {
		if (this.#adjusting) return;
		this.#adjusting = true;
		const { sx, sy } = this.paper.scale();
		const before = this.paper.translate();
		// fitToContent grid/min units are scaled px: scaling them by the current
		// zoom keeps the local area an exact multiple of the page size, which
		// addPageBreaks depends on
		this.paper.fitToContent({
			gridWidth: this.#basePage.width * sx,
			gridHeight: this.#basePage.height * sy,
			minWidth: this.#basePage.width * sx,
			minHeight: this.#basePage.height * sy,
			allowNewOrigin: 'any',
			useModelGeometry: opt.useModelGeometry
		});
		const after = this.paper.translate();
		// fitToContent never changes scale, so compensating the scroll by the
		// translate delta keeps the content visually still
		this.el.scrollLeft += after.tx - before.tx;
		this.el.scrollTop += after.ty - before.ty;
		this.#adjusting = false;
	}

	remove() {
		this.#resizeObserver.disconnect();
		if (this.#rafId != null) {
			this.el.ownerDocument.defaultView.cancelAnimationFrame(this.#rafId);
			this.#rafId = null;
		}
		this.#stopDragScroll();
		this.#panListeners?.stop();
		this.paper.off(null, null, this);
		this.el.remove();
		this.paper = null;
	}

	#updatePadding() {
		const x = this.el.clientWidth;
		const y = this.el.clientHeight;
		if (x === this.#padding.x && y === this.#padding.y) return;
		this.backgroundEl.style.padding = `${y}px ${x}px`;
		this.el.scrollLeft += x - this.#padding.x;
		this.el.scrollTop += y - this.#padding.y;
		this.#padding = { x, y };
	}

	#requestAdjust() {
		if (this.#rafId != null) return;
		this.#rafId = this.el.ownerDocument.defaultView.requestAnimationFrame(() => {
			this.#rafId = null;
			if (!this.paper) return;
			this.adjustPaper();
		});
	}

	#viewportCenterClient() {
		const rect = this.el.getBoundingClientRect();
		return {
			x: rect.left + this.el.clientLeft + this.el.clientWidth / 2,
			y: rect.top + this.el.clientTop + this.el.clientHeight / 2
		};
	}

	#scrollLocalPointToCenter(point) {
		const paperPoint = this.paper.localToPaperPoint(point);
		this.el.scrollLeft = this.#padding.x + paperPoint.x - this.el.clientWidth / 2;
		this.el.scrollTop = this.#padding.y + paperPoint.y - this.el.clientHeight / 2;
	}

	#onCellDragMove(evt) {
		this.#dragScroll.clientX = evt.clientX;
		this.#dragScroll.clientY = evt.clientY;
		if (this.#dragScroll.intervalId != null) return;
		this.#dragScroll.intervalId = this.el.ownerDocument.defaultView.setInterval(
			() => this.#dragScrollTick(),
			DRAG_SCROLL_INTERVAL
		);
	}

	#dragScrollTick() {
		const rect = this.el.getBoundingClientRect();
		const { clientX, clientY } = this.#dragScroll;
		const step = (overshoot) => Math.min(Math.max(overshoot, 0), DRAG_SCROLL_MAX_STEP);
		this.el.scrollLeft += step(clientX - (rect.right - DRAG_SCROLL_EDGE))
			- step((rect.left + DRAG_SCROLL_EDGE) - clientX);
		this.el.scrollTop += step(clientY - (rect.bottom - DRAG_SCROLL_EDGE))
			- step((rect.top + DRAG_SCROLL_EDGE) - clientY);
	}

	#stopDragScroll() {
		if (this.#dragScroll.intervalId == null) return;
		this.el.ownerDocument.defaultView.clearInterval(this.#dragScroll.intervalId);
		this.#dragScroll.intervalId = null;
	}
};
