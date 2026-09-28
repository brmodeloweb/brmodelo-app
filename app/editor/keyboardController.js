import hotkeys from 'hotkeys-js';

export const types = {
	SAVE: 'save',
	UNDO: 'undo',
	REDO: 'redo',
	ZOOM_IN: 'zoomIn',
	ZOOM_OUT: 'zoomOut',
	ZOOM_NONE: 'zoomNone',
	ESC: 'esc',
	DELETE: 'delete',
	COPY: 'copy',
	CUT: 'cut',
	PASTE: 'paste',
	PRINT: 'print'
}

export default class KeyboardController {
	constructor(document, clipboard, graph) {
		this.document = document;
		this.graph = graph;
		this.spacePressed = false;
		this.shortcutHandlers = new Map();
		this.clipboard = clipboard;
		this.lastClickedPoint = {
			"x": null,
			"y": null
		 }
		this.#registerSpaceEvents();
		this.#registerShortcutEvents();
	}

	#registerSpaceEvents() {
		this.document.addEventListener('keydown', this.spaceDownHandler);
		this.document.addEventListener('keyup', this.spaceUpHandler);
	}

	#registerShortcutEvents() {
		hotkeys.unbind();

		this.hotkeyConfigs.forEach(({ key, eventName }) => {
			hotkeys(key, () => {
				this.shortcutHandlers.get(eventName)?.forEach(action => action());
				return false;
			});
		})
	}

	get isSpacePressed() {
		return this.spacePressed;
	}

	get hotkeyConfigs() {
		return [
			{ key: 'command+s, ctrl+s', eventName: types.SAVE },
			{ key: 'command+z, ctrl+z', eventName: types.UNDO },
			{ key: 'command+p, ctrl+p', eventName: types.PRINT },
			{ key: 'command+shift+z, ctrl+shift+z', eventName: types.REDO },
			{ key: 'backspace', eventName: types.DELETE },
			{ key: 'command+c, ctrl+c', eventName: types.COPY },
			{ key: 'command+x, ctrl+x', eventName: types.CUT },
			{ key: 'command+v, ctrl+v', eventName: types.PASTE },
			{ key: 'z+=', eventName: types.ZOOM_IN },
			{ key: 'z+-', eventName: types.ZOOM_OUT },
			{ key: 'z+0', eventName: types.ZOOM_NONE },
			{ key: 'esc', eventName: types.ESC },
		];
	}

	spaceDownHandler = (keyboardEvent) => {
		if (keyboardEvent.code === "Space" && keyboardEvent.target == this.document.body) {
			this.spacePressed = true;
			keyboardEvent.preventDefault();
		}
	}

	spaceUpHandler = (keyboardEvent) => {
		if (keyboardEvent.code === "Space" && keyboardEvent.target == this.document.body) {
			this.spacePressed = false;
			keyboardEvent.preventDefault();
		}
	}

	registerHandler(eventName, action) {
		const currentActions = this.shortcutHandlers.has(eventName) ? this.shortcutHandlers.get(eventName) : [];
		this.shortcutHandlers.set(eventName, [action, ...currentActions])
	}

	unbindAll() {
		this.document.removeEventListener("keydown", this.spaceDownHandler);
		this.document.removeEventListener("keyup", this.spaceUpHandler);
		hotkeys.unbind();
	}

	setLastClickedPoint(point) {
		this.lastClickedPoint = point;
	}

	getLastClickedPoint() {
		return this.lastClickedPoint;
	}

	copy(cells) {
		this.clipboard.copyElements(cells, this.graph);
	}

	cut(cells) {
		this.clipboard.cutElements(cells, this.graph);
	}

	paste() {
		const lastPoint = this.getLastClickedPoint();
		if(lastPoint.x != null) {
			this.clipboard.pasteCellsAtPoint(this.graph, lastPoint);
		} else {
			this.clipboard.pasteCells(this.graph);
		}
	}

};