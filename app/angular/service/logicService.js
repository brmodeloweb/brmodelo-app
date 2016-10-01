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
	}

	ls.applyResizePage = function(){
		var $app = $('#content');
		ls.paperScroller = new joint.ui.PaperScroller({
				autoResizePaper: true,
				paper: ls.paper
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

		var obj = {
			"name": "id" + originName,
			"type": "Integer",
			"PK": false,
			"FK": true,
			"tableOrigin": source.attributes.id
		}

		target.addAttribute(obj);
	}

	ls.applyComponentSelection = function() {
		ls.paper.on('cell:pointerup', function(cellView, evt, x, y) {
			if (cellView.model instanceof joint.dia.Link) return;
			ls.onSelectElement(cellView);
		});

		ls.paper.on('blank:pointerdown', function(evt, x, y) {
			if(ls.selectedElement != null && ls.selectedElement.model != null){
				ls.selectedElement.unhighlight();
			}
			ls.clearSelectedElement();
		});
	}

	ls.clearSelectedElement = function(){
		ls.selectedElement = {};
		$rootScope.$broadcast('name:updated', "");
		$rootScope.$broadcast('columns:select', []);
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

	ls.onSelectElement = function (cellView){
		var name = "";
		if(ls.selectedElement.model != null) ls.selectedElement.unhighlight();
		if(cellView.model.attributes.name != null){
			ls.selectedElement = cellView;
			name = 	ls.selectedElement.model.attributes.name;
			ls.selectedElement.highlight();
			ls.applySelectionOptions(cellView);

			var selected = ls.selectedElement.model.attributes.attributes;
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
		selected.splice(index, 1);
		$rootScope.$broadcast('columns:select', selected);
		ls.selectedElement.model.deleteColumn(index);
	}

	ls.editColumn = function(index) {
		console.log(ls.selectedElement.model.attributes.objects[index]);
	}

	return ls;
});
