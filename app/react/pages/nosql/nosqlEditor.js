import { dia } from '@joint/core';
import { types } from "../../../editor/keyboardController";
import Editor from '../../../editor/editor';
import NoSqlFactory from './factory';
import note from "../../../joint/notes";
import link from "../../../joint/link";
import namespace from "../../../joint/namespace";
import ToolsViewService from "../../../editor/toolsViewService";
import ShapePalette from "../../../editor/shapePalette";
import Conversor from "./conversor";

export default class NoSqlEditor extends Editor {
	shapeFactory = null;
	customActions = {};
	toolsViewService = null;
	selectedElementToolbar = null;
	selectedElementResizer = null;
	refModeActive = false;
	refModeSource = null;
	_suppressLinkCleanup = false;
	conversionOptionModal = null;

	constructor(document, container, conversionOptionModal, customActions = {}) {
		super(document, container, { selection: true, command: true, snaplines: true });
		this.conversionOptionModal = conversionOptionModal || null;
		this.customActions = customActions;
		this.shapeFactory = new NoSqlFactory();
		this.toolsViewService = new ToolsViewService();
		this.registerGraphEvents();
		this.registerCustomPaperEvents();
		this.registerShapePalette();
		this.registerCommandManager();
		this.registerCustomShortcuts();
		super.addPageBreaks();
	}

	// //////////////////////////////////////////////////////////////////
	// Keyboard shortcuts
	// //////////////////////////////////////////////////////////////////

	registerCustomShortcuts() {
		const commands = [];
		if (this.customActions.saveModel) {
			commands.push({ shortcut: types.SAVE, action: () => this.customActions.saveModel() });
		}
		commands.push({ shortcut: types.ESC, action: () => this.unselectAll() });
		super.registerCustomShortcuts(commands);
	}

	// //////////////////////////////////////////////////////////////////
	// ShapePalette
	// //////////////////////////////////////////////////////////////////

	registerShapePalette() {
		const shapePalette = new ShapePalette({
			paper: this.paper,
			width: 132,
			height: 440
		});

		shapePalette.render();
		this.document.getElementById('shape-palette').appendChild(shapePalette.el);

		shapePalette.load([
			this.shapeFactory.createCollection({ position: { x: 15, y: 20 }, size: { width: 105, height: 80 } }),
			new note.Note({ position: { x: 25, y: 120 } })
		]);
	}

	// //////////////////////////////////////////////////////////////////
	// Graph events
	// //////////////////////////////////////////////////////////////////

	registerGraphEvents() {
		super.registerGraphEvents();

		this.graph.on('add', (cell) => {
			if (cell.attributes.type === 'nosql.Collection') {
				this._deduplicateName(cell);
				if (cell.getRows().length === 0) {
					cell.addRow([], { kind: 'attribute', name: '_id', type: 'ID', identifier: true });
				}
				if (this.customActions.onCollectionsChanged) {
					this.customActions.onCollectionsChanged();
				}
			}
		});

		this.graph.on('remove', (cell) => {
			this._onCellRemoved(cell);
			this.unselectAll();
			if (cell.attributes?.type === 'nosql.Collection' && this.customActions.onCollectionsChanged) {
				this.customActions.onCollectionsChanged();
			}
		});

		this.graph.on('change:size', (cell) => {
			if (cell.attributes.type === 'nosql.Collection') {
				this._enforceMinSize(cell);
			}
		});

		this.paper.el.addEventListener('nosql:row:dblclick', (evt) => {
			if (!this.customActions.selectRow) return;
			const { path, modelId } = evt.detail;
			const cell = this.graph.getCell(modelId);
			if (!cell) return;
			const cellView = this.paper.findViewByModel(cell);
			this.customActions.selectElement({
				value: cell.getName(),
				type: cell.attributes.type,
				element: cellView
			});
			this.customActions.selectRow(path);
		});
	}

	_onCellRemoved(cell) {
		const cellId = cell.id;

		// Link removed → remove corresponding ref row from target collection
		if (cell.isLink()) {
			if (!this._suppressLinkCleanup) {
				this._removeLinkReference(cellId);
			}
			return;
		}

		// Collection removed → remove orphaned reference rows in other collections
		if (cell.attributes?.type === 'nosql.Collection') {
			this.graph.getElements().forEach(element => {
				if (element.attributes.type !== 'nosql.Collection') return;
				if (element.id === cellId) return;
				this._removeReferencesToCollection(element, cellId);
			});
		}
	}

	_removeLinkReference(linkId) {
		this._removeMatchingRefs(row => row.linkId === linkId);
	}

	_removeReferencesToCollection(element, collectionId) {
		const rows = element.getRows();
		const result = this._filterRefsRecursive(rows, row => row.targetCollectionId === collectionId);
		if (result.changed) {
			element.set('rows', result.rows);
		}
	}

	_removeMatchingRefs(predicate) {
		this.graph.getElements().forEach(element => {
			if (element.attributes.type !== 'nosql.Collection') return;
			const rows = element.getRows();
			const result = this._filterRefsRecursive(rows, predicate);
			if (result.changed) {
				element.set('rows', result.rows);
			}
		});
	}

	_filterRefsRecursive(rows, predicate) {
		let changed = false;
		const filtered = rows.filter(row => {
			if (row.kind === 'reference' && predicate(row)) {
				changed = true;
				return false;
			}
			return true;
		}).map(row => {
			if (row.kind === 'block' && row.children) {
				const childResult = this._filterRefsRecursive(row.children, predicate);
				if (childResult.changed) {
					changed = true;
					return { ...row, children: childResult.rows };
				}
			}
			return row;
		});
		return { rows: filtered, changed };
	}

	_deduplicateName(cell) {
		const baseName = cell.getName();
		const existingNames = this.graph.getElements()
			.filter(el => el.id !== cell.id && el.attributes.type === 'nosql.Collection')
			.map(el => el.getName());

		let newName = baseName;
		let counter = 1;
		while (existingNames.includes(newName)) {
			newName = baseName + counter;
			counter++;
		}

		if (newName !== baseName) {
			cell.setName(newName);
		}
	}

	_enforceMinSize(cell) {
		const minWidth = 160;
		const minHeight = 70;
		const size = cell.size();
		if (size.width < minWidth || size.height < minHeight) {
			cell.resize(
				Math.max(size.width, minWidth),
				Math.max(size.height, minHeight)
			);
		}
	}

	// //////////////////////////////////////////////////////////////////
	// Paper events
	// //////////////////////////////////////////////////////////////////

	registerCustomPaperEvents() {
		this.paper.on('element:pointerup', (cellView) => {
			if (this.refModeActive) {
				this._handleRefModeClick(cellView);
				return;
			}

			this.onSelectElement(cellView);
			this.activateElementToolbar(cellView);
		});

		this.paper.on('element:pointerdblclick', () => {
			if (this.customActions.openMenu) {
				this.customActions.openMenu();
			}
		});

		this.paper.on('link:mouseenter', (linkView) => {
			const toolsView = this.toolsViewService.getToolsView();
			linkView.addTools(toolsView);
		});

		this.paper.on('link:mouseleave', (linkView) => {
			linkView.removeTools();
		});

		this.paper.on('link:options', (cellView) => {
			this.onSelectElement(cellView);
		});

		this.paper.on('blank:pointerdown', () => {
			this.unselectAll();
		});

		// Track last pointer position (paper coords) to resolve link drop targets
		// for action:link:add, which doesn't expose the pointer. Listen on
		// document so we keep tracking during toolbar link drags (toolbar captures
		// mousemove on document, bypassing paper.el).
		this._onDocumentMouseMove = (evt) => {
			this._lastPointerClient = { x: evt.clientX, y: evt.clientY };
		};
		this.document.addEventListener('mousemove', this._onDocumentMouseMove);
	}

	destroy() {
		if (this._onDocumentMouseMove) {
			this.document.removeEventListener('mousemove', this._onDocumentMouseMove);
			this._onDocumentMouseMove = null;
		}
		super.destroy();
	}

	// //////////////////////////////////////////////////////////////////
	// Element selection
	// //////////////////////////////////////////////////////////////////

	onSelectElement(cellView) {
		if (cellView != null) {
			if (this.elementSelector != null) {
				this.elementSelector.collection.reset([]);
			}

			const model = cellView.model;
			const isLink = model.isLink();
			const elementType = isLink ? "Link" : model.get('type');
			let value = '';
			if (!isLink) {
				if (elementType === 'custom.Note') {
					value = model.attributes?.attrs?.text?.text || '';
				} else if (model.getName) {
					value = model.getName();
				}
			}

			this.customActions.selectElement({
				value: value,
				type: elementType,
				element: cellView
			});
			return;
		}

		this.customActions.selectElement({
			value: "",
			type: "blank",
			element: null
		});
	}

	// //////////////////////////////////////////////////////////////////
	// ElementToolbar (selection handles)
	// //////////////////////////////////////////////////////////////////

	activateElementToolbar(cellView) {
		if (this.selectedElementToolbar != null) {
			this.selectedElementToolbar.remove();
		}
		if (this.selectedElementResizer != null) {
			this.selectedElementResizer.remove();
			this.selectedElementResizer = null;
		}

		const toolbar = this.createDefaultElementToolbar(cellView);

		toolbar.on('action:link:add', (link) => {
			this._onLink(link);
		});

		this.selectedElementToolbar = toolbar;
		toolbar.render();

		const elementResizer = this.createElementResizer(cellView);
		this.selectedElementResizer = elementResizer;
	}

	_resolveDropPath(target) {
		if (!this._lastPointerClient || !target.findContainingBlockPath) return [];
		const point = this.paper.clientToLocalPoint(this._lastPointerClient);
		const pos = target.position();
		return target.findContainingBlockPath(point.x - pos.x, point.y - pos.y);
	}

	_onLink(link) {
		const source = this.graph.getCell(link.get('source').id);
		const target = this.graph.getCell(link.get('target').id);

		if (!source || !target) {
			link.remove();
			return;
		}

		if (source.get('type') === 'custom.Note' || target.get('type') === 'custom.Note') {
			link.attr('line/stroke', '#AAA7AD');
			link.attr('line/strokeDasharray', '5,3');
			this.paper.findViewByModel(link.id).update();
			return;
		}

		// Link between two collections creates a reference attribute
		if (source.get('type') === 'nosql.Collection' && target.get('type') === 'nosql.Collection') {
			if (target.hasReferenceToCollection(source.id)) {
				link.remove();
				return;
			}

			const refRow = {
				kind: 'reference',
				name: source.getName() + '_REF',
				type: source.getIdentifierType(),
				isReference: true,
				targetCollectionId: source.id,
				targetCollectionName: source.getName(),
				linkId: link.id
			};

			const path = this._resolveDropPath(target);
			target.addRow(path, refRow);
			this.setDirty(true);

			if (this.customActions.selectElement) {
				this.customActions.selectElement({
					value: target.getName(),
					type: target.attributes.type,
					element: this.paper.findViewByModel(target)
				});
			}
		}
	}

	// //////////////////////////////////////////////////////////////////
	// Update handler (called from React sidebar)
	// //////////////////////////////////////////////////////////////////

	onUpdate = (event) => {
		this.setDirty(true);
		const model = event.element.model;

		switch (event.type) {
			case 'editName':
				model.setName(event.value);
				break;
			case 'addRow': {
				const rowValue = { ...event.value };
				if (rowValue.kind === 'reference' && rowValue.targetCollectionId && !rowValue.linkId) {
					const targetId = event.element.model.id;
					const sourceId = rowValue.targetCollectionId;
					if (model.hasReferenceToCollection(sourceId)) {
						return;
					}
					const link = new link({
						source: { id: sourceId },
						target: { id: targetId }
					});
					this.graph.addCell(link);
					rowValue.linkId = link.id;
				}
				model.addRow(event.path, rowValue, event.insertAt);
				break;
			}
			case 'editRow':
				model.editRow(event.path, event.value);
				break;
			case 'deleteRow': {
				const row = model.getRowAtPath(event.path);
				if (row && row.kind === 'reference' && row.linkId) {
					const link = this.graph.getCell(row.linkId);
					if (link) {
						this._suppressLinkCleanup = true;
						try { link.remove(); } finally { this._suppressLinkCleanup = false; }
					}
				}
				model.deleteRow(event.path);
				break;
			}
			case 'toggleCollapse':
				model.toggleBlockCollapse(event.path);
				break;
			case 'reorderRow':
				model.moveRow(event.path, event.fromIndex, event.toIndex);
				break;
			case 'addDisjunctionGroup':
				return model.addDisjunctionGroup(event.value);
			case 'deleteDisjunctionGroup':
				model.deleteDisjunctionGroup(event.groupId);
				break;
		}
	}

	// //////////////////////////////////////////////////////////////////
	// Reference Attribute
	// //////////////////////////////////////////////////////////////////

	startReferenceAttributeMode() {
		this.refModeActive = true;
		this.refModeSource = null;
	}

	cancelReferenceAttributeMode() {
		if (this.refModeSource) {
			const sourceView = this.paper.findViewByModel(this.refModeSource);
			if (sourceView) sourceView.unhighlight();
		}
		this.refModeActive = false;
		this.refModeSource = null;
	}

	_handleRefModeClick(cellView) {
		const model = cellView.model;
		if (model.attributes.type !== 'nosql.Collection') return;

		if (!this.refModeSource) {
			this.refModeSource = model;
			cellView.highlight();
			return;
		}

		const source = this.refModeSource;
		const destination = model;

		if (destination.hasReferenceToCollection(source.id)) {
			this.cancelReferenceAttributeMode();
			if (this.customActions.clearSelection) this.customActions.clearSelection();
			return;
		}

		const link = new link({
			source: { id: source.id },
			target: { id: destination.id }
		});
		this.graph.addCell(link);

		const refRow = {
			kind: 'reference',
			name: source.getName() + '_REF',
			type: source.getIdentifierType(),
			isReference: true,
			targetCollectionId: source.id,
			targetCollectionName: source.getName(),
			linkId: link.id
		};

		destination.addRow([], refRow);

		const sourceView = this.paper.findViewByModel(source);
		if (sourceView) sourceView.unhighlight();

		this.refModeActive = false;
		this.refModeSource = null;
		this.setDirty(true);

		if (this.customActions.selectElement) {
			this.customActions.selectElement({
				value: destination.getName(),
				type: destination.attributes.type,
				element: this.paper.findViewByModel(destination)
			});
		}
	}

	isRefModeActive() {
		return this.refModeActive;
	}

	// //////////////////////////////////////////////////////////////////
	// Unselect
	// //////////////////////////////////////////////////////////////////

	unselectAll() {
		if (this.elementSelector != null) {
			this.elementSelector.collection.reset([]);
		}
		if (this.selectedElementToolbar != null) {
			this.selectedElementToolbar.remove();
		}
		if (this.selectedElementResizer != null) {
			this.selectedElementResizer.remove();
			this.selectedElementResizer = null;
		}
		if (this.customActions.clearSelection) {
			this.customActions.clearSelection();
		}
		if (this.customActions.closeFeedback) {
			this.customActions.closeFeedback();
		}
	}

	// //////////////////////////////////////////////////////////////////
	// Data accessors
	// //////////////////////////////////////////////////////////////////

	loadCollections() {
		return this.graph.getElements()
			.filter(el => el.attributes.type === 'nosql.Collection')
			.map(el => ({
				name: el.getName(),
				id: el.id,
				rows: el.getRows()
			}));
	}

	// //////////////////////////////////////////////////////////////////
	// EER → NoSQL conversion
	// //////////////////////////////////////////////////////////////////

	async insertCollection({ name, position }) {
		const collection = this.shapeFactory.createCollection({
			name,
			position: position || { x: 100, y: 100 },
			size: { width: 160, height: 70 },
		});
		this.graph.addCell(collection);
		collection.setName(name);
		// The 'add' handler auto-inserts an _id attribute into empty collections;
		// clear it so the converter can populate with the entity's own key.
		collection.set('rows', []);
		return collection;
	}

	// Adds a reference row to `hostCollection` at `path`, also creating the
	// JointJS link that visually connects the referenced collection → host.
	// Mirrors the `addRow`/`reference` branch of onUpdate so the conversor can
	// bypass the UI event pipe but still produce a graph with proper links.
	addReference(hostCollection, path, refData) {
		if (!refData || refData.kind !== 'reference' || !refData.targetCollectionId) return null;
		const sourceId = refData.targetCollectionId;
		const targetId = hostCollection.id;
		if (hostCollection.hasReferenceToCollection && hostCollection.hasReferenceToCollection(sourceId)) {
			return null;
		}
		const link = new link({
			source: { id: sourceId },
			target: { id: targetId },
		});
		this.graph.addCell(link);
		const rowWithLink = { ...refData, linkId: link.id };
		const insertedIndex = hostCollection.addRow(path, rowWithLink);
		return { link, insertedIndex };
	}

	async toNoSql(conceptualJson) {
		const graph = new dia.Graph({}, { cellNamespace: namespace });
		const conceptualGraphLoaded = graph.fromJSON(conceptualJson);
		await new Conversor(this, this.conversionOptionModal).toNoSql(conceptualGraphLoaded);
		this.setDirty(true);
	}

	sortRows() {
		const rank = (row) => {
			if (row.kind === 'attribute' && row.identifier) return 0;
			if (row.kind === 'reference') return 1;
			return 2;
		};
		const sortRecursive = (rows) => {
			const sorted = [...rows].sort((a, b) => rank(a) - rank(b));
			let changed = sorted.some((row, i) => row !== rows[i]);
			for (const row of sorted) {
				if (row.kind === 'block' && Array.isArray(row.children)) {
					const result = sortRecursive(row.children);
					if (result.changed) {
						row.children = result.rows;
						changed = true;
					}
				}
			}
			return { rows: sorted, changed };
		};
		const collections = this.graph.getElements().filter(el => el.attributes.type === 'nosql.Collection');
		for (const collection of collections) {
			const result = sortRecursive(collection.getRows());
			if (!result.changed) continue;
			collection.set('rows', result.rows);
			const view = this.paper.findViewByModel(collection);
			view?.updateSize?.();
			view?.update?.();
		}
	}
}
