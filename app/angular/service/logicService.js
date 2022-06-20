import angular from "angular";

import "backbone";
import $ from "jquery";

import * as joint from "jointjs/dist/joint";
import shapes from "../../joint/shapes";
joint.shapes.erd = shapes;
import "jointjs/dist/joint.min.css";

import "../editor/editorManager"
import "../editor/editorScroller"
import "../editor/editorActions"
import "../editor/elementActions";

import KeyboardController, { types } from "../components/keyboardController";
import conversorService from "../service/conversorService"
import Column from "./Column";
import ToolsViewService from "../service/toolsViewService";

const logicService = ($rootScope, ModelAPI, LogicFactory, LogicConversorService) => {
	var ls = {};

	ls.model = {
		id: '',
		name: 'mymodel',
		type: 'logic',
		model: '',
		user: $rootScope.loggeduser
	}

	ls.selectedElement = {
		"name": ''
	};

	ls.selectedActions = null;

	ls.selectedLink = {};

	ls.buildWorkspace = function (modelid, userId, callback, conversionId) {
		ls.graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
		ls.paper = new joint.dia.Paper({
			width: $('#content').width(),
			height: $('#content').height(),
			gridSize: 10,
			drawGrid: true,
			model: ls.graph
		});

		ls.editorActions = new joint.ui.EditorActions({ graph: ls.graph });

		ls.keyboardController = new KeyboardController(ls.paper.$document);

		ls.toolsViewService = new ToolsViewService();

		ls.paper.on('link:options', function (link, evt, x, y) {

			var source = ls.graph.getCell(link.model.get('source').id);
			var target = ls.graph.getCell(link.model.get('target').id);

			var obj = {
				'a': {
					'source': source.attributes.name,
					'target': target.attributes.name,
					'card': link.model.attributes.labels[0].attrs.text.text
				},
				'b': {
					'source': target.attributes.name,
					'target': source.attributes.name,
					'card': link.model.attributes.labels[1].attrs.text.text
				}
			}

			ls.selectedLink = link;
			$rootScope.$broadcast('link:select', obj);

		});

		ls.applyResizePage();
		ls.applyDragAndDrop();
		ls.applyComponentSelection();
		ls.applyGraphEvents();
		ls.applyDeleteLinkAction();
		ls.registerShortcuts();

		ls.loadModel(modelid, userId, callback, conversionId);
	}

	ls.editCardinalityA = function (card) {
		ls.selectedLink.model.label(0,
			{
				position: 0.2,
				attrs: { text: { text: card, 'font-weight': 'normal', 'font-size': 12 } }
			});
	}

	ls.editCardinalityB = function (card) {
		ls.selectedLink.model.label(1,
			{
				position: 0.8,
				attrs: { text: { text: card, 'font-weight': 'normal', 'font-size': 12 } }
			});
	}

	ls.applyDeleteLinkAction = function () {
		ls.graph.on('remove', function (cell, collection, opt) {
			if (cell.isLink()) {
				var source = ls.graph.getCell(cell.get('source').id);
				var target = ls.graph.getCell(cell.get('target').id);
				var objects = target.attributes.objects;
				for (var i = 0; i < objects.length; i++) {
					var object = objects[i];
					if (object.FK && object.tableOrigin.idOrigin == source.id) {
						//target.attributes.attributes.splice(i, 1);
						target.deleteColumn(i);
						$rootScope.$broadcast('element:update', ls.paper.findViewByModel(target));
						$rootScope.$broadcast("element:isDirty");
						break;
					}
				}
			}
		})
	}

	ls.applyGraphEvents = function () {
		ls.graph.on('add', function (cell) {
			ls.checkAndEditTableName(cell);
			$rootScope.$broadcast("element:isDirty");
		});

		ls.graph.on('change', function (cell) {
			$rootScope.$broadcast("element:isDirty");
		});
	}

	ls.applyResizePage = function () {
		const content = $('#content');
		ls.editorScroller = new joint.ui.EditorScroller({
			autoResizePaper: true,
			paper: ls.paper,
			cursor: 'grab'
		});
		content.append(ls.editorScroller.render().el);
	}

	ls.applyDragAndDrop = function () {
		const enditorManager = new joint.ui.EditorManager({
			graph: ls.graph,
			paper: ls.paper,
		});
		$(".elements-holder").append(enditorManager.render().el);
		enditorManager.loadElements([
			LogicFactory.createTable()
		]);
	}

	ls.applyComponentSelection = () => {
		ls.paper.on('cell:pointerup', function (cellView, evt, x, y) {
			if (cellView.model instanceof joint.dia.Link) return;
			ls.onSelectElement(cellView);
		});

		ls.paper.on('blank:pointerdown', (evt) => {
			if (ls.selectedElement != null && ls.selectedElement.model != null) {
				ls.checkAndEditTableName(ls.selectedElement.model);
				ls.selectedElement.unhighlight();
			}

			ls.clearSelectedElement();

			if(!ls.keyboardController.spacePressed){

			} else {
				ls.editorScroller.startPanning(evt);
			}
		});

		ls.paper.on('link:mouseenter', (linkView) => {
			const toolsView = ls.toolsViewService.getToolsView();
			linkView.addTools(toolsView);
		});

		ls.paper.on('link:mouseleave', (linkView) => {
			linkView.removeTools();
		});
	}

	ls.applySelectionOptions = function (cellView) {
		const elementActions = new joint.ui.ElementActions({
			cellView: cellView,
			boxContent: false
		});
		elementActions.on('action:link:add', (link) => {
			ls.onLink(link);
		});
		ls.selectedActions = elementActions;
		elementActions.render();
	}

	ls.checkAndEditTableName = function (model) {
		var name = model.get('name');
		var elements = ls.graph.getElements();
		var size = elements.length;
		var count = -1;
		for (var i = 0; i < size; i++) {
			if (elements[i].get('name') == name) {
				count++;
			}
		}
		if (count > 0) {
			model.set('name', name + count);
			ls.checkAndEditTableName(model);
			$rootScope.$broadcast('element:update', ls.paper.findViewByModel(model));
		}
	}

	ls.loadModel = function (modelid, userId, callback, conversionId) {

		if (modelid != null && modelid != "") {
			ModelAPI.getModel(modelid, userId).then(function (resp) {
				ls.model.name = resp.data.name;
				ls.model.type = resp.data.type;
				ls.model.id = resp.data._id;
				const logicJsonModel = (typeof resp.data.model == "string") ? JSON.parse(resp.data.model) : resp.data.model;
				ls.graph.fromJSON(logicJsonModel);
				callback();
				$rootScope.$broadcast('model:loaded', resp.data);
				if (conversionId != null && conversionId != "" && modelid != "") {
					ModelAPI.getModel(conversionId, userId).then(function (resp) {
						const graph =new joint.dia.Graph({}, { cellNamespace: joint.shapes });
						const conceptualJsonModel = (typeof resp.data.model == "string") ? JSON.parse(resp.data.model) : resp.data.model;
						const promise = LogicConversorService.toLogic(graph.fromJSON(conceptualJsonModel), ls);
						promise.then(function (tables) {
							//	ls.updateModel();
						});
					});
				}

			});
		}

	}

	ls.insertTable = function (table) {
		var newTable = LogicFactory.createTable();

		if (table.name.length > 15) {
			newTable.attributes.size.width = table.name.length * 7;
		}

		newTable.attributes.position.x = (table.position.x);
		newTable.attributes.position.y = (table.position.y);
		newTable.set('name', table.name);

		var columns = table.columns;

		for (var j = 0; j < columns.length; j++) {
			const column = new Column({
				name: columns[j].name,
				PK: columns[j].PK,
			});
			newTable.addAttribute(column);
		}
		ls.graph.addCell(newTable);

		return newTable;
	}

	ls.updateModel = function () {
		ls.model.model = JSON.stringify(ls.graph);
		return ModelAPI.updateModel(ls.model).then(function (res) {
			return res;
		});
	}

	ls.onLink = function (link) {

		link.label(0,
			{
				position: 0.2,
				attrs: { text: { text: "(1, 1)", 'font-weight': 'normal', 'font-size': 12 } }
			});

		link.label(1,
			{
				position: 0.8,
				attrs: { text: { text: "(0, n)", 'font-weight': 'normal', 'font-size': 12 } }
			});

		var source = ls.graph.getCell(link.get('source').id);
		var target = ls.graph.getCell(link.get('target').id);

		var originName = source.attributes.name;
		var idOrigin = source.attributes.id;
		const column = new Column({
			name: "id" + originName,
			FK: true,
			idOrigin,
			idLink: link.id,
		});

		if (target) target.addAttribute(column);
		$rootScope.$broadcast('element:update', ls.paper.findViewByModel(target));
	}

	ls.clearSelectedElement = function () {
		if(ls.selectedActions != null) {
			ls.selectedActions.remove();
			ls.selectedActions = null;
		}
		if (ls.selectedElement != null && ls.selectedElement.model != null) {
			ls.selectedElement.unhighlight();
		}
		ls.selectedElement = {};
		$rootScope.$broadcast('element:select', null);
		$rootScope.$broadcast('link:select', null);
		$rootScope.$broadcast('columns:select', []);
		$rootScope.$broadcast('clean:logic:selection');
	}

	ls.onSelectElement = function (cellView) {
		var name = "";
		if (ls.selectedElement.model != null) ls.selectedElement.unhighlight();
		if (cellView.model.attributes.name != null) {
			ls.selectedElement = cellView;
			name = ls.selectedElement.model.attributes.name;
			ls.selectedElement.highlight();
			ls.applySelectionOptions(cellView);

			var selected = ls.selectedElement.model.attributes.objects;
			$rootScope.$broadcast('columns:select', selected);
		}
		$rootScope.$broadcast('element:select', ls.selectedElement.model);
	}

	ls.editName = function (newName) {
		if (newName != null && newName != "") {
			ls.selectedElement.model.set('name', newName);
			$rootScope.$broadcast('element:update', ls.selectedElement);
		}
	}

	ls.deleteColumn = function (index) {
		var selected = ls.selectedElement.model.attributes.attributes;
		var object = ls.selectedElement.model.attributes.objects[index];

		if (object.FK) {
			var link = ls.graph.getCell(object.tableOrigin.idLink);
			link.remove();
		} else {
			ls.selectedElement.model.deleteColumn(index);
		}

		$rootScope.$broadcast('element:update', ls.selectedElement);
	}

	ls.editColumn = function (index, editedColumn) {

		var name = editedColumn.name;

		if (editedColumn.PK) {
			name = name + ": PK";
		}
		// ls.selectedElement.model.attributes.attributes[index] = name;
		//  	ls.selectedElement.model.attributes.objects[index].name = name;

		ls.selectedElement.model.editColumn(index, name, editedColumn);
		$rootScope.$broadcast('element:update', ls.selectedElement);
	}

	ls.addColumn = function (column) {
		if (column.FK) {
			var myLink = new joint.shapes.erd.Line({
				source: {
					id: column.tableOrigin.idOrigin
				},
				target: {
					id: ls.selectedElement.model.id
				}
			});
			myLink.label(0,
				{
					position: 0.2,
					attrs: { text: { text: "(1, 1)", 'font-weight': 'normal', 'font-size': 12 } }
				});

			myLink.label(1,
				{
					position: 0.8,
					attrs: { text: { text: "(0, n)", 'font-weight': 'normal', 'font-size': 12 } }
				});
			if (myLink.attributes.source.id != myLink.attributes.target.id) {
				myLink.addTo(ls.graph);
			}
			column.tableOrigin.idLink = myLink.id;
		}
		ls.selectedElement.model.addAttribute(column);
		$rootScope.$broadcast('element:update', ls.selectedElement);
	}

	ls.undo = function () {
		ls.editorActions.undo();
	}

	ls.redo = function () {
		ls.editorActions.redo();
	}

	ls.zoomIn = function () {
		ls.editorScroller.zoom(0.2, { max: 2 });
	}

	ls.zoomOut = function () {
		ls.editorScroller.zoom(-0.2, { min: 0.2 });
	}

	ls.zoomNone = function () {
		ls.editorScroller.zoom();
	}

	ls.registerShortcuts = () => {
		ls.keyboardController.registerHandler(types.UNDO, () => ls.undo());
		ls.keyboardController.registerHandler(types.REDO, () => ls.redo());
		ls.keyboardController.registerHandler(types.ZOOM_IN, () => ls.zoomIn());
		ls.keyboardController.registerHandler(types.ZOOM_OUT, () => ls.zoomOut());
		ls.keyboardController.registerHandler(types.ZOOM_NONE, () => ls.zoomNone());
		ls.keyboardController.registerHandler(types.ESC, () => ls.clearSelectedElement());
		ls.keyboardController.registerHandler(types.SAVE, () => {
			ls.updateModel();
			$rootScope.$broadcast('model:saved')
		});
	}

	ls.getTablesMap = function () {
		var map = new Map();
		var elements = ls.graph.getElements();
		for (var i = 0; i < elements.length; i++) {
			map.set(elements[i].attributes.name, elements[i].id);
		}
		return map;
	}

	ls.buildTablesJson = function () {
		var map = new Map();
		var elements = ls.graph.getElements();
		for (var i = 0; i < elements.length; i++) {
			var obj = {
				"name": elements[i].attributes.name,
				"columns": elements[i].attributes.objects
			}
			map.set(elements[i].id, obj);
		}
		return map;
	}

	ls.unbindAll = () => {
		ls.keyboardController.unbindAll()
	}

	return ls;
}

export default angular
	.module("app.LogicService", [conversorService])
	.factory("LogicService", logicService).name;