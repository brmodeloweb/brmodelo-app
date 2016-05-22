angular.module('myapp').factory('LogicService', function($rootScope, ModelAPI, LogicFactory){
	var ls = {};

	ls.model = {
		id: '',
		name: 'mymodel',
		type: 'logic',
		model: '',
		user: $rootScope.loggeduser
	}
	ls.selectedElement = {};

	ls.buildWorkspace = function(modelid, userId) {
		ls.graph = new joint.dia.Graph;
		ls.paper = new joint.dia.Paper({
			width: $('#content').width(),
			height: $('#content').height(),
			gridSize: 1,
			model: ls.graph
		});

		ls.applyResizePage();
		ls.loadModel(modelid, userId);
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

	ls.loadModel = function(modelid, userId) {
		ModelAPI.getModel(modelid, userId).then(function(resp){
			ls.model.name = resp.data[0].name;
			ls.model.type = resp.data[0].type;
			ls.model.id   = resp.data[0]._id;
			ls.graph.fromJSON(JSON.parse(resp.data[0].model));
		});
	}

	ls.updateModel = function(){
		ls.model.model = JSON.stringify(ls.graph);
		return ModelAPI.updateModel(ls.model).then(function(res){
			return res;
		});
	}

	ls.applyComponentSelection = function(){
		ls.paper.on('cell:pointerup', function(cellView, evt, x, y) {
			if (cellView.model instanceof joint.dia.Link) return;
			ls.onSelectElement(cellView);
			var halo = new joint.ui.Halo({
				cellView: cellView,
				boxContent: false
			});
			halo.on('action:link:add', function(link) {
				onLink(link);
			});
			halo.on('action:removeElement:pointerdown', function(link) {
				console.log("removing....");
			});
			halo.removeHandle('clone');
			halo.removeHandle('fork');
			halo.removeHandle('rotate');
			halo.render();
		});

		ls.paper.on('blank:pointerdown', function(evt, x, y) {
			if(ls.selectedElement != null && ls.selectedElement.model != null) ls.selectedElement.unhighlight();
		});
	}

	ls.onSelectElement = function (cellView){
		var name = "";
		if(ls.selectedElement.model != null) ls.selectedElement.unhighlight();
		if(cellView.model.attributes.name != null){
			ls.selectedElement = cellView;
			name = 	cellView.model.attributes.name;
			ls.selectedElement.highlight();
		}
		$rootScope.$broadcast('name:updated', name);
	}

	ls.editName = function(newName){
		if(newName != null && newName != "") {
			ls.selectedElement.model.set('name', newName);
		}
	}

	return ls;
});