import { util } from '@joint/core';

const PASTE_OFFSET = 20;

export default class Clipboard {
	#cells = [];
	#pasteCount = 0;

	copyElements(selection, graph) {
		const elements = [...(selection.models ?? selection)];
		this.#cells = Object.values(graph.cloneSubgraph(elements, { deep: true }));
		this.#pasteCount = 0;
	}

	cutElements(selection, graph) {
		const elements = [...(selection.models ?? selection)];
		this.copyElements(elements, graph);
		graph.removeCells(elements);
	}

	pasteCells(graph) {
		this.#pasteCount += 1;
		const offset = PASTE_OFFSET * this.#pasteCount;
		this.#paste(graph, offset, offset);
	}

	pasteCellsAtPoint(graph, point) {
		if (this.#cells.length === 0) return;
		const bbox = this.#elementsBBox();
		this.#paste(graph, point.x - bbox.x - bbox.width / 2, point.y - bbox.y - bbox.height / 2);
	}

	#paste(graph, dx, dy) {
		if (this.#cells.length === 0) return;
		const clones = Object.values(util.cloneCells(this.#cells));
		clones.forEach((cell) => cell.translate(dx, dy));
		graph.addCells(clones);
	}

	#elementsBBox() {
		return this.#cells
			.filter((cell) => cell.isElement())
			.reduce((union, element) => {
				const bbox = element.getBBox();
				return union == null ? bbox : union.union(bbox);
			}, null);
	}
};
