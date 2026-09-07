import { highlighters } from '@joint/core';

const LINK_TARGET_HIGHLIGHT = 'brmw-element-toolbar-link-target';

const HANDLE_GROUPS = {
	remove: 'actions',
	link: 'links',
	fork: 'links'
};

export default class ElementToolbar {
	cellView = null;
	paper = null;
	el = null;
	makeElement = null;
	#handles = [];
	#listeners = new Map();
	#groupEls = {};
	#removed = false;
	#activeDrag = null;

	constructor({ cellView, handles = [] }) {
		this.cellView = cellView;
		this.paper = cellView.paper;
		this.#handles = [...handles];
	}

	on(event, callback) {
		if (!this.#listeners.has(event)) this.#listeners.set(event, []);
		this.#listeners.get(event).push(callback);
	}

	addHandle(handle) {
		this.#handles.push(handle);
	}

	removeHandle(name) {
		this.#handles = this.#handles.filter((handle) => handle.name !== name);
	}

	render() {
		const doc = this.paper.el.ownerDocument;
		this.el = doc.createElement('div');
		this.el.className = 'brmw-element-toolbar';
		this.#groupEls.actions = doc.createElement('div');
		this.#groupEls.actions.className = 'brmw-element-toolbar-actions';
		this.#groupEls.links = doc.createElement('div');
		this.#groupEls.links.className = 'brmw-element-toolbar-links';
		this.el.appendChild(this.#groupEls.actions);
		this.el.appendChild(this.#groupEls.links);

		this.#handles.forEach((handle) => {
			const buttonEl = doc.createElement('button');
			buttonEl.className = `brmw-element-toolbar-handle brmw-element-toolbar-${handle.name}`;
			buttonEl.setAttribute('type', 'button');
			buttonEl.style.backgroundImage = `url("${handle.icon}")`;
			buttonEl.addEventListener('pointerdown', (evt) => {
				evt.preventDefault();
				evt.stopPropagation();
				this.#onHandlePointerdown(handle.name, evt);
			});
			this.#groupEls[handle.group ?? HANDLE_GROUPS[handle.name] ?? 'actions'].appendChild(buttonEl);
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
		this.#activeDrag?.cancel();
		this.cellView.model.off(null, null, this);
		this.paper.off(null, null, this);
		this.el.remove();
	}

	#trigger(event, ...args) {
		(this.#listeners.get(event) ?? []).forEach((callback) => callback(...args));
	}

	#updatePosition() {
		const bbox = this.cellView.getBBox();
		this.#groupEls.actions.style.left = `${bbox.x}px`;
		this.#groupEls.actions.style.top = `${bbox.y - 28}px`;
		this.#groupEls.links.style.left = `${bbox.x + bbox.width + 8}px`;
		this.#groupEls.links.style.top = `${bbox.y}px`;
	}

	#onHandlePointerdown(name, evt) {
		if (name === 'remove') {
			const model = this.cellView.model;
			this.remove();
			model.remove();
			return;
		}
		if (name === 'link') {
			this.#startLinkDrag(evt);
			return;
		}
		if (name === 'fork') {
			this.#startForkDrag(evt);
		}
	}

	#startLinkDrag(evt) {
		const graph = this.paper.model;
		graph.startBatch('toolbar-link');
		const startPoint = this.paper.clientToLocalPoint({ x: evt.clientX, y: evt.clientY });
		const link = this.#createDraggedLink({ x: startPoint.x, y: startPoint.y });

		let highlightedView = null;
		const highlightTarget = (targetView) => {
			if (targetView === highlightedView) return;
			if (highlightedView) highlighters.mask.remove(highlightedView, LINK_TARGET_HIGHLIGHT);
			if (targetView) {
				highlighters.mask.add(targetView, 'root', LINK_TARGET_HIGHLIGHT, {
					attrs: { stroke: this.#highlightColor(), 'stroke-width': 3 }
				});
			}
			highlightedView = targetView;
		};

		this.#trackPointer(evt, {
			onMove: (point) => {
				link.set('target', { x: point.x, y: point.y });
				highlightTarget(this.#findElementViewAtPoint(point));
			},
			onDrop: (point) => {
				highlightTarget(null);
				const targetView = this.#findElementViewAtPoint(point);
				if (targetView) {
					link.set('target', { id: targetView.model.id });
				}
				this.#releaseDraggedLink(link);
				this.#trigger('action:link:add', link);
				graph.stopBatch('toolbar-link');
			},
			onCancel: () => {
				highlightTarget(null);
				link.remove();
				graph.stopBatch('toolbar-link');
			}
		});
	}

	#startForkDrag(evt) {
		if (!this.makeElement) return;
		const graph = this.paper.model;
		graph.startBatch('fork');

		const [element] = [].concat(this.makeElement());
		const startPoint = this.paper.clientToLocalPoint({ x: evt.clientX, y: evt.clientY });
		const centerAt = (point) => {
			const { width, height } = element.size();
			element.position(point.x - width / 2, point.y - height / 2);
		};
		centerAt(startPoint);
		element.addTo(graph);

		const link = this.#createDraggedLink({ id: element.id });

		this.#trackPointer(evt, {
			onMove: centerAt,
			onDrop: () => {
				this.#releaseDraggedLink(link);
				this.#trigger('action:link:add', link);
				graph.stopBatch('fork');
			},
			onCancel: () => {
				link.remove();
				element.remove();
				graph.stopBatch('fork');
			}
		});
	}

	// pointer-events off while dragging: the pointer travels right over the
	// temporary link, and link:mouseenter handlers would resolve its endpoints
	// before the target id exists
	#createDraggedLink(target) {
		const link = this.paper.getDefaultLink(this.cellView, this.cellView.el);
		link.set('source', { id: this.cellView.model.id });
		link.set('target', target);
		link.attr('wrapper/pointer-events', 'none');
		link.addTo(this.paper.model);
		return link;
	}

	#releaseDraggedLink(link) {
		link.removeAttr('wrapper/pointer-events');
	}

	#trackPointer(evt, { onMove, onDrop, onCancel }) {
		const doc = this.paper.el.ownerDocument;
		const toLocal = (pointerEvt) => this.paper.clientToLocalPoint({ x: pointerEvt.clientX, y: pointerEvt.clientY });
		const stopTracking = () => {
			doc.removeEventListener('pointermove', onPointerMove);
			doc.removeEventListener('pointerup', onPointerUp);
			doc.removeEventListener('pointercancel', onPointerCancel);
			this.#activeDrag = null;
		};
		const onPointerMove = (moveEvt) => onMove(toLocal(moveEvt));
		const onPointerUp = (upEvt) => {
			stopTracking();
			onDrop(toLocal(upEvt));
		};
		const onPointerCancel = () => {
			stopTracking();
			onCancel?.();
		};
		doc.addEventListener('pointermove', onPointerMove);
		doc.addEventListener('pointerup', onPointerUp);
		doc.addEventListener('pointercancel', onPointerCancel);
		this.#activeDrag = {
			cancel: () => {
				stopTracking();
				onCancel?.();
			}
		};
	}

	#highlightColor() {
		const doc = this.paper.el.ownerDocument;
		const brandColor = getComputedStyle(doc.documentElement).getPropertyValue('--brand-primary-30');
		return brandColor.trim() || '#00997f';
	}

	#findElementViewAtPoint(point) {
		const views = this.paper.findElementViewsAtPoint(point);
		return views[views.length - 1] ?? null;
	}
};
