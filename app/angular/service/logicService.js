angular.module('myapp').factory('LogicService', function($rootScope, ModelAPI, LogicFactory){
	var ls = {};

	ls.model = {
		id: '',
		name: 'mymodel',
		type: 'logic',
		model: '',
		user: $rootScope.loggeduser
	}

	ls.selectedElement = {
		"name":''
	};

	ls.buildWorkspace = function(modelid, userId, callback) {
		ls.graph = new joint.dia.Graph;
		ls.paper = new joint.dia.Paper({
			width: $('#content').width(),
			height: $('#content').height(),
			gridSize: 1,
			model: ls.graph
		});

		ls.applyResizePage();
		ls.loadModel(modelid, userId, callback);
		ls.applyDragAndDrop();
		ls.applyComponentSelection();
		ls.applyGraphEvents();
		ls.applyDeleteLinkAction();
	}

	ls.applyDeleteLinkAction = function(){
		ls.graph.on('remove', function(cell, collection, opt) {
			if (cell.isLink()) {
				var source = ls.graph.getCell(cell.get('source').id);
				var target = ls.graph.getCell(cell.get('target').id);
				var objects = target.attributes.objects;
				for (var i = 0; i < objects.length; i++) {
					var object = objects[i];
					if(object.FK && object.tableOrigin.idOrigin == source.id){
						//target.attributes.attributes.splice(i, 1);
						target.deleteColumn(i);
						break;
					}
				}
			}
		})
	}

	ls.applyGraphEvents = function(){
		ls.graph.on('add', function(cell) {
			ls.checkAndEditTableName(cell);
		});
	}

	ls.applyResizePage = function(){
		var $app = $('#content');
		ls.paperScroller = new joint.ui.PaperScroller({
				autoResizePaper: true,
				paper: ls.paper,
				cursor: 'grab'
		});
		ls.paper.on('blank:pointerdown', ls.paperScroller.startPanning);
		$app.append(ls.paperScroller.render().el);
	}

	ls.applyDragAndDrop = function (){
		var stencil = new joint.ui.Stencil({
			graph: ls.graph,
			paper: ls.paper
		});
		$('#stencil-holder').append(stencil.render().el);
		stencil.load([
			LogicFactory.createTable()
		]);
	}

	ls.applyComponentSelection = function() {
		ls.paper.on('cell:pointerup', function(cellView, evt, x, y) {
			if (cellView.model instanceof joint.dia.Link) return;
			ls.onSelectElement(cellView);
		});

		ls.paper.on('blank:pointerdown', function(evt, x, y) {
			if(ls.selectedElement != null && ls.selectedElement.model != null){
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
		halo.on('action:link:add', function(link) {
			ls.onLink(link);
		});
		halo.on('action:removeElement:pointerdown', function(link) {
			console.log("removing....");
		});
		halo.removeHandle('clone');
		halo.removeHandle('fork');
		halo.removeHandle('rotate');
		halo.render();
	}

	ls.checkAndEditTableName = function(model){
		var name = model.get('name');
		var elements = ls.graph.getElements();
		var size = elements.length;
		var count = -1;
		for (var i = 0; i < size; i++) {
			if(elements[i].get('name') == name){
				count++;
			}
		}
		if(count > 0) {
			model.set('name', name+count);
			ls.checkAndEditTableName(model);
		}
	}

	ls.loadModel = function(modelid, userId, callback) {
		ModelAPI.getModel(modelid, userId).then(function(resp){
			ls.model.name = resp.data[0].name;
			ls.model.type = resp.data[0].type;
			ls.model.id   = resp.data[0]._id;
			ls.graph.fromJSON(JSON.parse(resp.data[0].model));
			callback();
		});
	}

	ls.updateModel = function(){
		ls.model.model = JSON.stringify(ls.graph);
		return ModelAPI.updateModel(ls.model).then(function(res){
			return res;
		});
	}

	ls.onLink = function(link){

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
	}

	ls.clearSelectedElement = function(){
		ls.selectedElement = {};
		$rootScope.$broadcast('name:updated', "");
		$rootScope.$broadcast('columns:select', []);
		$rootScope.$broadcast('clean:logic:selection');
	}

	ls.onSelectElement = function (cellView){
		var name = "";
		if(ls.selectedElement.model != null) ls.selectedElement.unhighlight();
		if(cellView.model.attributes.name != null){
			ls.selectedElement = cellView;
			name = 	ls.selectedElement.model.attributes.name;
			ls.selectedElement.highlight();
			ls.applySelectionOptions(cellView);

			var selected = ls.selectedElement.model.attributes.objects;
			$rootScope.$broadcast('columns:select', selected);
		}
		$rootScope.$broadcast('name:updated', name);
	}

	ls.editName = function(newName){
		if(newName != null && newName != "") {
			ls.selectedElement.model.set('name', newName);
		}
	}

	ls.deleteColumn = function(index) {
		var selected = ls.selectedElement.model.attributes.attributes;
		var object = ls.selectedElement.model.attributes.objects[index];

		if(object.FK){
			var link = ls.graph.getCell(object.tableOrigin.idLink);
			link.remove();
		} else {
			ls.selectedElement.model.deleteColumn(index);
		}
	}

	ls.editColumn = function(index, editedColumn) {
		console.log(editedColumn);

			var name = editedColumn.name;

			if(editedColumn.PK){
				name = name + ": PK";
			}
			// ls.selectedElement.model.attributes.attributes[index] = name;
			//  	ls.selectedElement.model.attributes.objects[index].name = name;

			ls.selectedElement.model.editColumn(index, name, editedColumn);
	}

	ls.addColumn = function(column) {
		if(column.FK){
			var myLink = new joint.shapes.erd.Line({
				source: {
					id: column.tableOrigin.idOrigin
				},
				target: {
					id: ls.selectedElement.model.id
				}
			});
			myLink.addTo(ls.graph);
		}
		column.tableOrigin.idLink = myLink.id;
		ls.selectedElement.model.addAttribute(column);
	}

	ls.getTablesMap = function() {
		var map = new Map();
		var elements = ls.graph.getElements();
		for (var i = 0; i < elements.length; i++) {
			map.set(elements[i].attributes.name, elements[i].id);
		}
		return map;
	}

	return ls;
});
