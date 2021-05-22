import angular from "angular";

import "backbone";
import $ from "jquery";

import * as joint from "jointjs";
import shapes from "../../joint/shapes";
joint.shapes.erd = shapes;
import "jointjs/dist/joint.min.css";

import "../../joint/joint.ui.stencil";
import "../../joint/joint.ui.stencil.css";
import "../../joint/joint.ui.selectionView";
import "../../joint/joint.ui.selectionView.css";
import "../../joint/joint.ui.halo.css";
import "../../joint/joint.ui.halo";
import "../../joint/br-scroller";
import "../../joint/joint.dia.command";

import conversorService from "../service/conversorService"

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

	ls.selectedLink = {};

	ls.buildWorkspace = function (modelid, userId, callback, conversionId) {
		ls.graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });
		ls.paper = new joint.dia.Paper({
			width: $('#content').width(),
			height: $('#content').height(),
			gridSize: 1,
			model: ls.graph
		});
		ls.commandManager = new joint.dia.CommandManager({ graph: ls.graph });

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
						break;
					}
				}
			}
		})
	}

	ls.applyGraphEvents = function () {
		ls.graph.on('add', function (cell) {
			ls.checkAndEditTableName(cell);
		});
	}

	ls.applyResizePage = function () {
		var $app = $('#content');
		ls.paperScroller = new joint.ui.PaperScroller({
			autoResizePaper: true,
			paper: ls.paper,
			cursor: 'grab'
		});
		ls.paper.on('blank:pointerdown', ls.paperScroller.startPanning);
		$app.append(ls.paperScroller.render().el);
	}

	ls.applyDragAndDrop = function () {
		var stencil = new joint.ui.Stencil({
			graph: ls.graph,
			paper: ls.paper
		});
		$('#stencil-holder').append(stencil.render().el);
		stencil.load([
			LogicFactory.createTable()
		]);
	}

	ls.applyComponentSelection = function () {
		ls.paper.on('cell:pointerup', function (cellView, evt, x, y) {
			if (cellView.model instanceof joint.dia.Link) return;
			ls.onSelectElement(cellView);
		});

		ls.paper.on('blank:pointerdown', function (evt, x, y) {
			if (ls.selectedElement != null && ls.selectedElement.model != null) {
				ls.checkAndEditTableName(ls.selectedElement.model);
				ls.selectedElement.unhighlight();
			}
			ls.clearSelectedElement();
		});
	}

	ls.applySelectionOptions = function (cellView) {
		var halo = new joint.ui.Halo({
			cellView: cellView,
			boxContent: false
		});
		halo.on('action:link:add', function (link) {
			ls.onLink(link);
		});
		halo.on('action:removeElement:pointerdown', function (link) {
			console.log("removing....");
		});
		halo.removeHandle('clone');
		halo.removeHandle('fork');
		halo.removeHandle('rotate');
		halo.render();
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
			var obj = {
				"name": columns[j].name,
				"type": "Integer",
				"PK": columns[j].PK,
				"FK": false,
				"tableOrigin": {
					"idOrigin": "",
					"idLink": ""
				}
			}
			newTable.addAttribute(obj);
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

		var obj = {
			"name": "id" + originName,
			"type": "Integer",
			"PK": false,
			"FK": true,
			"tableOrigin": {
				"idOrigin": idOrigin,
				"idLink": link.id
			}
		}

		target.addAttribute(obj);
		$rootScope.$broadcast('element:update', ls.paper.findViewByModel(target));
	}

	ls.clearSelectedElement = function () {
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
		ls.commandManager.undo();
	}

	ls.redo = function () {
		ls.commandManager.redo();
	}

	ls.zoomIn = function () {
		ls.paperScroller.zoom(0.2, { max: 2 });
	}

	ls.zoomOut = function () {
		ls.paperScroller.zoom(-0.2, { min: 0.2 });
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

	return ls;
}

export default angular
	.module("app.LogicService", [conversorService])
	.factory("LogicService", logicService).name;
