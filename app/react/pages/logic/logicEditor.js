import { types } from "../../../editor/keyboardController";
import Editor from '../../../editor/editor';
import LogicFactory from './factory';
import note from "../../../joint/notes";
import link from "../../../joint/link";
import namespace from "../../../joint/namespace";
import Column from "./Column";
import ToolsViewService from "../../../editor/toolsViewService";
import ShapePalette from "../../../editor/shapePalette";
import Conversor from './conversor';
import { dia } from '@joint/core';

export default class LogicEditor extends Editor {
    shapeFactory = null;
    customActions = {};
    toolsViewService = null;
    selectedElementToolbar = null;
    selectedElementResizer = null;
    model = null;

    constructor(document, container, conversionAttributeModal, conversionOptionModal, customActions = {}) {
        super(document, container, { selection: true, command: true, snaplines: true });
        this.conversionAttributeModal = conversionAttributeModal;
        this.conversionOptionModal = conversionOptionModal;
        this.customActions = customActions;
        this.shapeFactory = new LogicFactory();
        this.toolsViewService = new ToolsViewService();
        this.registerGraphEvents();
        this.registerCustomPaperEvents();
        this.registerShapePalette();
        this.registerCommandManager();
        this.registerCustomShortcuts();
        super.addPageBreaks();
        this.paper.options.defaultConnectionPoint = { name: 'rectangle' }
    }

    registerCustomShortcuts() {
        const commands = [];
        if(this.customActions.saveModel) {
            commands.push({ shortcut: types.SAVE, action: () => this.customActions.saveModel() });
        }
        commands.push({ shortcut: types.ESC, action: () => this.unselectAll() });
        super.registerCustomShortcuts(commands);
    }

    registerGraphEvents() {
        super.registerGraphEvents();

        this.graph.on('add', (cell) => {
			const type = cell.attributes.type;
			if(type === 'logic.Table' || type === 'uml.Abstract') {
				this.checkAndEditTableName(cell);
			}
        });

        this.graph.on('remove', (cell) => {
			if(cell.attributes.type === 'link') {
				this.removeLinkColumn(cell);
			}

			this.unselectAll();
		});
    }

	removeLinkColumn(cell) {
		const target = cell.attributes?.target;
		if (!target?.id) return;

		const targetCell = this.graph.getCell(target.id);
		if (targetCell != null && targetCell.attributes.type === 'logic.Table') {
			const rows = targetCell.getRows();
			const index = rows.findIndex(row => {
				return row.tableOrigin != null && row.tableOrigin.idLink === cell.attributes.id;
			});
			if (index > -1) {
				this.deleteColumn(this.paper.findViewByModel(targetCell), index);
			}
		}
	}

    onSelectElement(cellView) {
        if (cellView != null) {
            if (this.elementSelector != null) {
                this.elementSelector.collection.reset([]);
            }

            const elementType = cellView.model.isLink() ? "Link" : cellView.model.get('type');
            const value = elementType === "custom.Note" ? cellView.model.attributes.attrs.text.text : cellView.model.attributes.name;
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

    onUpdate = (event) => {
        this.setDirty(true);
        switch (event.type) {
            case 'updateName':
                event.element.model.set('name', event.value);
                event.element.updateSize();
                break;
            case 'addColumn':
                this.addColumn(event.element, event.value);
                break;
            case 'editColumn':
                this.editColumn(event.element, event.index, event.value);
                break;
            case 'deleteColumn':
                this.deleteColumn(event.element, event.index);
                break;
            case 'reorderColumns':
                event.element.model.moveRow(event.fromIndex, event.toIndex);
                event.element.updateSize();
                event.element.update();
                this.customActions.selectElement({
                    value: event.element.model.attributes.name,
                    type: event.element.model.attributes.type,
                    element: event.element
                });
                break;
            case 'saveView':
                this.saveView(event.element, event.value);
                break;
        }
    }

    addColumn(element, column, linkLabels = { source: "(1, 1)", target: "(0, n)" }) {
        if (column.FK) {
            const myLink = new link({
                source: { id: column.tableOrigin.idOrigin },
                target: { id: element.model.id }
            });

            myLink.label(0, {
                position: 0.2,
                attrs: { text: { text: linkLabels.source, 'font-weight': 'normal', 'font-size': 12 } }
            });

            myLink.label(1, {
                position: 0.8,
                attrs: { text: { text: linkLabels.target, 'font-weight': 'normal', 'font-size': 12 } }
            });

            if (myLink.get('source').id !== myLink.get('target').id) {
                this.graph.addCell(myLink);
            }
            column.tableOrigin.idLink = myLink.id;
        }
        element.model.addRow(column);
		if (element?.updateSize) {
			element.updateSize();
		}
        element.update();
    }

    // Thin wrapper: resolves the view for a given table model and delegates
    // to addColumn. Lets callers work in terms of table models instead of
    // paper views, avoiding the `paper.findViewByModel` + `selectedElement`
    // dance at every call site.
    addColumnToTable(tableModel, column, linkLabels) {
        const view = this.paper.findViewByModel(tableModel);
        this.addColumn(view, column, linkLabels);
    }

    editColumn(element, index, editedColumn) {
        element.model.editRow(index, editedColumn);
		element.updateSize();
        element.update();
    }

    deleteColumn(element, index) {
        const model = element.model;
        const row = model.getRow(index);
        if (row && row.isForeignKey && row.tableOrigin) {
            const link = this.graph.getCell(row.tableOrigin.idLink);
            if (link != null) {
                link.remove();
            }
        }
        model.deleteRow(index);
		element.updateSize();
        element.update();
    }

    checkAndEditTableName(model) {
        const baseName = model.get('name');

        const elements = this.graph.getElements();
        const existingNames = elements
            .filter(element => element !== model)
            .map(element => element.get('name'))
            .filter(name => name !== undefined);

        let newName = baseName;
        let counter = 1;

        while (existingNames.includes(newName)) {
            newName = baseName + counter;
            counter++;
        }

        if (newName !== baseName) {
            model.set('name', newName);
            // requireView renders the view synchronously: on the async paper,
            // findViewByModel right after 'add' returns a view whose nodes
            // don't exist yet and updateSize would crash
            const targetView = this.paper.requireView(model);
            if (targetView?.updateSize) {
                targetView.updateSize();
                targetView.update();
            }
        }
    }

    registerCustomPaperEvents() {
        this.paper.on('link:options', (cellView) => {
            this.onSelectElement(cellView);
        });

        this.paper.on('element:pointerup', (cellView, evt) => {
            if (evt.ctrlKey || evt.metaKey) {
                this.elementSelector.collection.add(cellView.model);
                return;
            }
            this.onSelectElement(cellView);
            this.activateElementToolbar(cellView);
        });

        this.paper.on('link:mouseenter', (linkView) => {
            const connectionType = this.getConnectionType(linkView.model);
            const toolsView = this.toolsViewService.getToolsView(connectionType);
            linkView.addTools(toolsView);
        });

        this.paper.on('link:mouseleave', (linkView) => {
            linkView.removeTools();
        });

        this.paper.on('blank:pointerdown', () => this.unselectAll());

        this.paper.on('element:pointerdblclick', () => {
            if(this.customActions.openMenu) {
                this.customActions.openMenu();
            }
        });
    }

    getConnectionType(link) {
        const target = this.graph.getCell(link.get('target').id);
        return target?.get('type') === 'uml.Abstract' ? 'Table-View' : '';
    }

    activateElementToolbar(cellView) {
        if (this.selectedElementToolbar != null) {
            this.selectedElementToolbar.remove();
        }
        if (this.selectedElementResizer != null) {
            this.selectedElementResizer.remove();
            this.selectedElementResizer = null;
        }

		const toolbar = this.createDefaultElementToolbar(cellView);

        if (cellView.model.get('type') === 'uml.Abstract') {
            toolbar.removeHandle('link');
        }

        toolbar.on('action:link:add', (link) => {
            this.onLink(link);
        });

		this.selectedElementToolbar = toolbar;
        toolbar.render();

        const elementResizer = this.createElementResizer(cellView);
        this.selectedElementResizer = elementResizer;
    }

    onLink(link) {
        const source = this.graph.getCell(link.get('source').id);
        const target = this.graph.getCell(link.get('target').id);

        if(!source || !target) {
            link.remove();
            return;
        }

        if(source.get('type') === 'uml.Abstract' || target.get('type') === 'uml.Abstract') {
            link.remove();
            return;
        }

        if(source.get('type') === 'custom.Note' || target.get('type') === 'custom.Note') {
            link.attributes.attrs.line.stroke = "#AAA7AD";
            link.attributes.attrs.line["stroke-dasharray"] = "5,3";
            this.paper.findViewByModel(link.id).update();
            return;
        }

        if(source.get('type') === 'logic.Table' && target.get('type') === 'logic.Table') {
            link.label(0, {
                position: 0.2,
                attrs: { text: { text: "(1, 1)", 'font-weight': 'normal', 'font-size': 12 } }
            });

            link.label(1, {
                position: 0.8,
                attrs: { text: { text: "(0, n)", 'font-weight': 'normal', 'font-size': 12 } }
            });

            const originName = source.get('name');
            const idOrigin = source.id;
            const column = new Column({
                name: "id" + originName,
                FK: true,
                idOrigin,
                idLink: link.id,
            });

            if (target) {
                target.addRow(column);
                const targetView = this.paper.findViewByModel(target);
				targetView.updateSize();
            }
        }
    }

    registerShapePalette() {
        const shapePalette = new ShapePalette({
            paper: this.paper,
            width: 132,
            height: 440
        });

        shapePalette.render();
        this.document.getElementById('shape-palette').appendChild(shapePalette.el);

        shapePalette.load([
            this.shapeFactory.createNewTable({ position: { x: 15, y: 20 } }),
            this.shapeFactory.createView({ position: { x: 15, y: 150 } }),
            new note.Note({ position: { x: 25, y: 280 } })
        ]);
    }

    editCardinalityA(selectedLink, card) {
        if (selectedLink && selectedLink.model) {
            selectedLink.model.label(0, {
                position: 0.2,
                attrs: { text: { text: card, 'font-weight': 'normal', 'font-size': 12 } }
            });
        }
    }

    editCardinalityB(selectedLink, card) {
        if (selectedLink && selectedLink.model) {
            selectedLink.model.label(1, {
                position: 0.8,
                attrs: { text: { text: card, 'font-weight': 'normal', 'font-size': 12 } }
            });
        }
    }

    buildTablesJson() {
        const map = new Map();
        const elements = this.graph.getElements();
        const tables = elements.filter(element => element.get('type') === 'logic.Table');

        tables.forEach(element => {
            const obj = {
                name: element.get('name'),
                columns: element.getRows() || []
            };
            map.set(element.id, obj);
        });

        return map;
    }

    loadViews() {
        const elements = this.graph.getElements();
        return elements
            .filter(element => element.get('type') === 'uml.Abstract')
            .map(element => ({
                name: element.get('name'),
                tables: element.get('objects') || [],
                queryConditions: element.get('queryConditions') || []
            }));
    }

    saveView(element, view) {
        const model = element.model;
        const graph = model.graph;
        const neighbors = graph.getNeighbors(model);

        view.tables.forEach(table => {
            let linkedTable = neighbors.find(({ id }) => id === table.id);
            if (!table.selected && linkedTable) this.removeViewLink(table.id, graph, model);
            if (table.selected && !linkedTable) this.createViewLink(table.id, model);
        });

        if (model.saveView) {
            model.saveView(view);
        }
        element.update();
    }

    createLink(idTable1, idTable2) {
        const myLink = new link({
            source: { id: idTable1 },
            target: { id: idTable2 }
        });
        this.graph.addCell(myLink);
    }

    createViewLink(tableId, viewModel) {
        const myLink = new link({
            source: { id: tableId },
            target: { id: viewModel.id }
        });
        this.graph.addCell(myLink);
    }

    removeViewLink(tableId, graph, viewModel) {
        const link = graph.getLinks(viewModel).find(({ attributes: { source, target } }) =>
            source.id === tableId && target.id === viewModel.id);
        if (link) {
            link.remove();
        }
    }

    loadTables() {
        const elements = this.graph.getElements();
        const isTable = (element) => element.get('type') === 'logic.Table';
        return elements.filter(isTable).map(element => ({
            name: element.get('name'),
            columns: (element.getRows() || []).map(row => ({ ...row, selected: false })),
            id: element.id
        }));
    }

	loadViewsByTable(tableId) {
		const elements = this.graph.getElements();
		const views = elements.filter((element) => element.attributes.type === 'uml.Abstract');
		const viewsByTable = views.filter((view) => {
			const tables = view.attributes.objects;
			const table = tables.find(({ id, selected }) => id === tableId && selected);
			return table != null;
		});
		return viewsByTable
			.map(({ attributes }) => ({ name: attributes.name, tables: attributes.objects, queryConditions: attributes.queryConditions }));
	}

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
        if(this.customActions.clearSelection) {
            this.customActions.clearSelection();
        }
		if(this.customActions.closeFeedback) {
            this.customActions.closeFeedback();
        }
    }

    async insertTable(table) {
        const x = table.position.x;
        const y = table.position.y;

        this.paper.freeze();
        try {
            const newTable = this.shapeFactory.createNewTable({ position: { x, y }, name: table.name });
            this.graph.addCell(newTable);

            table.columns.forEach(column => {
                newTable.addRow(new Column({
                    name: column.name,
                    PK: column.PK,
                    FK: column.FK,
                    type: column.type || "",
                    tableOrigin: column.tableOrigin || null
                }));
            });

            return newTable;
        } finally {
            this.paper.unfreeze();
        }
    }

    async toLogic(conceptualJson) {
        const graph = new dia.Graph({}, { cellNamespace: namespace });
        const conceptualGraphLoaded = graph.fromJSON(conceptualJson);
        await new Conversor(this, this.conversionAttributeModal, this.conversionOptionModal).toLogic(conceptualGraphLoaded);
        this.setDirty(true);
    }

    sortColumns() {
        const rank = (row) => row.PK ? 0 : row.FK ? 1 : 2;
        const tables = this.graph.getElements().filter(el => el.attributes.type === 'logic.Table');
        for (const table of tables) {
            const rows = table.getRows();
            const sortedRows = [...rows].sort((a, b) => rank(a) - rank(b));
            const changed = sortedRows.some((row, i) => row !== rows[i]);
            if (!changed) continue;
            table.set('rows', sortedRows);
            const view = this.paper.findViewByModel(table);
            view?.updateSize?.();
            view?.update?.();
        }
    }

}