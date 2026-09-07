import { util } from '@joint/core';

const STACK_LIMIT = 200;
// The flag selection.js and future listeners use to recognize undo/redo replays
const REPLAY_OPT = { commandManager: true };

export default class CommandManager {
	graph = null;
	cmdBeforeAdd = null;
	#undoStack = [];
	#redoStack = [];
	#openBatch = null;
	#applying = false;

	constructor({ graph, cmdBeforeAdd }) {
		this.graph = graph;
		this.cmdBeforeAdd = cmdBeforeAdd;

		graph.on('add', (cell, collection, opt) => this.#onAdd(cell, opt), this);
		graph.on('remove', (cell, collection, opt) => this.#onRemove(cell, opt), this);
		graph.on('change', (cell, opt) => this.#onChange(cell, opt), this);
		graph.on('batch:stop', () => this.#onBatchStop(), this);
		graph.on('reset', () => this.reset(), this);
	}

	undo() {
		const batch = this.#undoStack.pop();
		if (!batch) return;
		this.#applying = true;
		for (let i = batch.length - 1; i >= 0; i--) {
			this.#revert(batch[i]);
		}
		this.#applying = false;
		this.#redoStack.push(batch);
	}

	redo() {
		const batch = this.#redoStack.pop();
		if (!batch) return;
		this.#applying = true;
		batch.forEach((command) => this.#apply(command));
		this.#applying = false;
		this.#undoStack.push(batch);
	}

	reset() {
		this.#undoStack = [];
		this.#redoStack = [];
		this.#openBatch = null;
	}

	#allowed(cmdName, cell, value, opt) {
		if (!this.cmdBeforeAdd) return true;
		return this.cmdBeforeAdd(cmdName, cell, value, opt);
	}

	#record(command) {
		if (this.#applying) return;
		this.#redoStack = [];
		const target = this.graph.hasActiveBatch()
			? (this.#openBatch ??= [])
			: null;

		if (command.type === 'change' && target) {
			const merged = target.find(
				(other) => other.type === 'change' && other.id === command.id && other.key === command.key
			);
			if (merged) {
				merged.next = command.next;
				return;
			}
		}

		if (target) {
			target.push(command);
		} else {
			this.#pushBatch([command]);
		}
	}

	#pushBatch(batch) {
		this.#undoStack.push(batch);
		if (this.#undoStack.length > STACK_LIMIT) this.#undoStack.shift();
	}

	#onBatchStop() {
		if (this.graph.hasActiveBatch() || !this.#openBatch) return;
		const batch = this.#openBatch;
		this.#openBatch = null;
		if (batch.length > 0) this.#pushBatch(batch);
	}

	#onAdd(cell, opt = {}) {
		if (this.#applying) return;
		if (!this.#allowed('add', cell, null, opt)) return;
		this.#record({ type: 'add', id: cell.id, cellJSON: cell.toJSON() });
	}

	#onRemove(cell, opt = {}) {
		if (this.#applying) return;
		if (!this.#allowed('remove', cell, null, opt)) return;
		this.#record({ type: 'remove', id: cell.id, cellJSON: cell.toJSON() });
	}

	#onChange(cell, opt = {}) {
		if (this.#applying) return;
		if (cell === this.graph) return;
		Object.keys(cell.changed).forEach((key) => {
			if (!this.#allowed(`change:${key}`, cell, cell.changed[key], opt)) return;
			this.#record({
				type: 'change',
				id: cell.id,
				key,
				prev: util.cloneDeep(cell.previous(key)),
				next: util.cloneDeep(cell.changed[key])
			});
		});
	}

	#revert(command) {
		const cell = this.graph.getCell(command.id);
		if (command.type === 'add') {
			cell?.remove(REPLAY_OPT);
		} else if (command.type === 'remove') {
			this.graph.addCell(util.cloneDeep(command.cellJSON), REPLAY_OPT);
		} else if (cell) {
			cell.set(command.key, util.cloneDeep(command.prev), REPLAY_OPT);
		}
	}

	#apply(command) {
		const cell = this.graph.getCell(command.id);
		if (command.type === 'add') {
			this.graph.addCell(util.cloneDeep(command.cellJSON), REPLAY_OPT);
		} else if (command.type === 'remove') {
			cell?.remove(REPLAY_OPT);
		} else if (cell) {
			cell.set(command.key, util.cloneDeep(command.next), REPLAY_OPT);
		}
	}
};
