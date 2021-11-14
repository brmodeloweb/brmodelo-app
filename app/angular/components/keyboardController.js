import hotkeys from 'hotkeys-js';

export default class KeyboardController {

	constructor(document) {
		this.document = document;
		this.spacePressed = false;
		this.shortcutHandlers = new Map();
		this.#registerSpaceEvents();
		this.#registerShortcutEvents();
	}

	#registerSpaceEvents() {
		const x = this.document.on('keydown', (keyboardEvent) => {
			if (keyboardEvent.code === "Space" && !keyboardEvent.originalEvent.repeat) {
				this.spacePressed = true;
			}
			keyboardEvent.preventDefault();
		});

		this.document.on('keyup', (keyboardEvent) => {
			if (keyboardEvent.code === "Space" && !keyboardEvent.originalEvent.repeat) {
				this.spacePressed = false;
				keyboardEvent.preventDefault();
			}
		});
	}

	#registerShortcutEvents() {
		hotkeys.unbind();

		hotkeys('command+s, ctrl+s', () => {
			this.shortcutHandlers.get("save").forEach(action => action());
			return false;
		});

		hotkeys('command+z, ctrl+z', () => {
			this.shortcutHandlers.get("undo").forEach(action => action());
			return false;
		});

		hotkeys('command+shift+z, ctrl+shift+z', () => {
			this.shortcutHandlers.get("redo").forEach(action => action());
			return false;
		});

		hotkeys('shift+z+=, z+=', () => {
			this.shortcutHandlers.get("zoomIn").forEach(action => action());
			return false;
		});

		hotkeys('shift+z+-, z+-', () => {
			this.shortcutHandlers.get("zoomOut").forEach(action => action());
			return false;
		});

		hotkeys('esc', () => {
			this.shortcutHandlers.get("esc").forEach(action => action());
			return false;
		});
	}

	get isSpacePressed() {
		return this.spacePressed;
	}

	registerHandler(eventName, action) {
		const currentActions = this.shortcutHandlers.has(eventName) ? this.shortcutHandlers.get(eventName) : [];
		this.shortcutHandlers.set(eventName, [action, ...currentActions])
	}

	unbindAll() {
		this.document.off("keydown");
		this.document.off("keyup");
		hotkeys.unbind();
	}

};