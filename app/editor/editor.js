import { dia, V } from '@joint/core';
import KeyboardController, { types } from "./keyboardController";
import Selection from "./selection";
import Clipboard from "./clipboard";
import ElementToolbar from "./elementToolbar";
import ElementResizer from "./elementResizer";
import Canvas from "./canvas";
import CommandManager from "./commandManager";
import Snaplines from "./snaplines";
import printPaper from "./print";
import namespace from "../joint/namespace";
import deleteIcon from "../img/editor/delete.svg";
import lineEndArrowIcon from "../img/editor/line-end-arrow.svg";

export default class Editor {
	paper = null;
	graph = null;
	keyboardController = null;
	canvas = null;
	dirty = false;
	document = null;
	commandManager = null;
	elementSelector = null;
	pageBreaksSettings = {
		pageBreaksVEl: null,
	}
	properties = {
		selection: false,
		command: false
	};

    constructor(document, container, customProperties = {}) {
		this.properties.selection = customProperties.selection || false;
		this.properties.command = customProperties.command || false;
		this.properties.snaplines = customProperties.snaplines || false;
		this.document = document;
		this.dirty = false;

		this.graph = new dia.Graph({}, { cellNamespace: namespace });

		this.paper = new dia.Paper({
			width: 1024,
			height: 1754,
			gridSize: 10,
			drawGrid: true,
			model: this.graph,
			cellViewNamespace: namespace,
			defaultLink: new namespace.link(),
			linkPinning: false,
			defaultConnectionPoint: {
				name: 'boundary',
				args: {
					sticky: true,
				}
			},
			async: true,
			sorting: dia.Paper.sorting.APPROX,
		});

		this.canvas = new Canvas({ paper: this.paper });

		container.appendChild(this.canvas.el);

		if(this.properties.selection){
			this.elementSelector = new Selection({ paper: this.paper });
		}

		if(this.properties.snaplines) {
			this.snaplines = new Snaplines({ paper: this.paper });
		}

		this.keyboardController = new KeyboardController(document, new Clipboard(), this.graph);
		this.registerDefaultShortcuts();
		this.registerPaperEvents();
		this.center();
    }

	print() {
		printPaper(this.paper);
	}

	zoomIn() {
		this.canvas.zoom(0.1, { max: 2 });
	}

	zoomOut() {
		this.canvas.zoom(-0.1, { min: 0.2 });
	}

	zoomNone() {
		this.paper.scale(1);
		this.canvas.center();
	}

	setGrid(showDotGrid) {
		this.paper.setGrid(showDotGrid);
	}

	setGridSize(gridSize) {
		this.paper.setGridSize(gridSize);
	}

	setSnaplines(showSnaplines) {
		if(showSnaplines) {
			this.snaplines.enable();
		} else {
			this.snaplines.disable();
		}
	}

	registerDefaultShortcuts() {
		this.keyboardController.registerHandler(types.ZOOM_IN, () => this.zoomIn());
		this.keyboardController.registerHandler(types.ZOOM_OUT, () => this.zoomOut());
		this.keyboardController.registerHandler(types.ZOOM_NONE, () => this.zoomNone());
		this.keyboardController.registerHandler(types.PRINT, () => this.print());
		if(this.properties.command) {
			this.keyboardController.registerHandler(types.UNDO, () => this.undo());
			this.keyboardController.registerHandler(types.REDO, () => this.redo());
			this.keyboardController.registerHandler(types.COPY, () => {this.keyboardController.copy(this.elementSelector.collection)});
			this.keyboardController.registerHandler(types.CUT, () => {this.keyboardController.cut(this.elementSelector.collection)});
			this.keyboardController.registerHandler(types.PASTE, () => {this.keyboardController.paste()});
			this.keyboardController.registerHandler(types.DELETE, () => {
				const models = this.elementSelector.collection.models;
				this.elementSelector.collection.reset([]);
				this.graph.removeCells(models);
		  	});
		}
	}

	registerCustomShortcuts(commands) {
		commands.forEach(command => {
			this.keyboardController.registerHandler(command.shortcut, command.action);
		});
	}

	registerPaperEvents() {
		this.paper.on('blank:pointerdown', (evt, x, y) => {
			if(this.keyboardController.spacePressed){
				this.canvas.startPanning(evt);
				this.canvas.setCursor("grabbing");
				return;
			}

			if(this.properties.selection){
				this.elementSelector.startSelecting(evt);
			}

			if(this.properties.command) {
				this.keyboardController.setLastClickedPoint({"x": x, "y": y});
			}
		});

		this.paper.on('blank:pointerup', () => {
			this.canvas.setCursor("default");
		});
	}

	registerCommandManager() {
		this.commandManager = new CommandManager({
			graph: this.graph,
			cmdBeforeAdd: (cmdName, _cellView, _value, { ignoreUndoRedo } = { ignoreUndoRedo: false }) => {
				const [, property] = cmdName.split(':');
				const ignoredChanges = ['infinitePaper', 'dotGrid', 'snaplines', 'gridSize'];
				return !ignoreUndoRedo && !ignoredChanges.some(change => change === property);
			}
		});
	}

	destroy() {
		this.canvas?.remove();
		this.canvas = null;
		this.paper = null;
		this.graph = null;
		this.keyboardController.unbindAll();
	}

	loadModel(model) {
		this.graph.fromJSON(model);
	}

	freeze() {
		this.paper.freeze();
	}

	setReadOnly() {
		this.paper.setInteractivity(false);
	}

	center() {
		this.canvas.center();
	}

	registerGraphEvents() {
		this.graph.on("change:position add remove", () => {
			if(this.paper && !this.paper.isFrozen()){
				this.setDirty(true);
			}	
		});
	}

	setDirty(isDirty) {
		this.dirty = isDirty;
	}

	undo() {
		if(this.commandManager) {
			this.commandManager.undo();
		}
	}

	redo() {
		if(this.commandManager) {
			this.commandManager.redo();
		}
	}

	addPageBreaks() {
		const pageBreakSettings = {
            color: '#ccc', // --gray-70
			width: 1024,
			height: 1754,
        }
		const paper = this.paper;
		const { color, width, height } = pageBreakSettings;

		const pageBreaksVEl = V('path', {
			stroke: color,
			fill: 'none',
			strokeDasharray: '5,5'
		});

		paper.layers.prepend(pageBreaksVEl.node);
		this.pageBreaksSettings.pageBreaksVEl = pageBreaksVEl;

		let lastArea = null;

		function updatePageBreaks() {
			const area = paper.getArea();
			// Do not update if the area is the same
			if (area.equals(lastArea)) return;
			lastArea = area;
			let d = '';
			// Draw vertical lines
			// Do not draw the first and last lines
			for (let x = width; x < area.width; x += width) {
				d += `M ${area.x + x} ${area.y} v ${area.height}`;
			}
			// Draw horizontal lines
			// Do not draw the first and last lines
			for (let y = height; y < area.height; y += height) {
				d += ` M ${area.x} ${area.y + y} h ${area.width}`;
			}
			pageBreaksVEl.attr('d', d || null);
		}

		updatePageBreaks();

		paper.on('translate resize', updatePageBreaks);

		this.pageBreaksSettings.remove = () => {
			paper.off('translate resize', updatePageBreaks);
			pageBreaksVEl.remove();
		};
	}

	setLogicDefaultConnectionPoint() {
		this.paper.options.defaultConnectionPoint = { name: 'rectangle' }
	}

	setPageBreaks(showPageBreaks) {
		if(showPageBreaks) {
			this.addPageBreaks();
		} else {
			this.removePageBreaks();
		}
	}

	removePageBreaks() {
		if(this.pageBreaksSettings.remove) {
			this.pageBreaksSettings.remove();
		}
	}

	get paper() {
		return this.paper;
	}

	get graph() {
		return this.graph;
	}

	get dirty() {
		return this.dirty;
	}

	createDefaultElementToolbar(cellView) {
		return new ElementToolbar({
			cellView,
			handles: [
				{ name: 'remove', icon: deleteIcon },
				{ name: 'link', icon: lineEndArrowIcon }
			]
		});
	}

	createElementResizer(cellView) {
		const elementResizer = new ElementResizer({
			cellView,
			minWidth: 50,
			minHeight: 30
		});
		elementResizer.render();
		return elementResizer;
	}
}