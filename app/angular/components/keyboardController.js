import hotkeys from 'hotkeys-js';

export const types = {
	SAVE: 'save',
	UNDO: 'undo',
	REDO: 'redo',
	ZOOM_IN: 'zoomIn',
	ZOOM_OUT: 'zoomOut',
	ESC: 'esc',
}

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

		this.hotkeyConfigs.forEach(({ key, eventName }) => {
			hotkeys(key, () => {
				this.shortcutHandlers.get(eventName).forEach(action => action());
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
			{ key: 'command+shift+z, ctrl+shift+z', eventName: types.REDO },
			{ key: 'shift+z+=, z+=', eventName: types.ZOOM_IN },
			{ key: 'shift+z+-, z+-', eventName: types.ZOOM_OUT },
			{ key: 'esc', eventName: types.ESC },
		];
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