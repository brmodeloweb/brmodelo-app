angular.module('myapp')
			 .controller("logicController",
				function($scope,
								 $http,
								 $window,
								 $rootScope,
								 $stateParams,
								 LogicFactory,
								 ModelAPI) {

	$scope.model = {
		id: '',
		name: 'mymodel',
		type: 'logic',
		model: '',
		user: $rootScope.loggeduser
	}

	$scope.selectedElement = {
		element: {},
		value: ""
	};

	$scope.initView = function(){
		buildWorkspace();

		ModelAPI.getModel($stateParams.modelid, $rootScope.loggeduser).then(function(resp){
			$scope.model.name = resp.data[0].name;
			$scope.model.type = resp.data[0].type;
			$scope.model.id   = resp.data[0]._id;
			$scope.graph.fromJSON(JSON.parse(resp.data[0].model));
		});

	}

	$scope.undoModel = function(){
		$scope.commandManager.undo();
	}

	$scope.redoModel = function(){
		$scope.commandManager.redo();
	}

	$scope.zoomIn = function(){
		$scope.paperScroller.zoom(0.2, { max: 2 });
	}

	$scope.zoomOut = function(){
		$scope.paperScroller.zoom(-0.2, { min: 0.2 });
	}

	$scope.changeVisible = function(){
		$scope.editionVisible = !$scope.editionVisible;
	}

	$scope.changeDropdownVisible = function(){
		$scope.dropdownVisible = !$scope.dropdownVisible;
	}

	$scope.saveModel = function() {
		$scope.model.model = JSON.stringify($scope.graph);
		ModelAPI.updateModel($scope.model).then(function(res){
			console.log("saved");
		});
	}

	$scope.onSelectElement = function(cellView) {

	}

	function buildWorkspace() {
		$scope.graph = new joint.dia.Graph;
		$scope.commandManager = new joint.dia.CommandManager({ graph: $scope.graph });

		$scope.paper = new joint.dia.Paper({
			width: $('#content').width(),
			height: $('#content').height(),
			gridSize: 1,
			model: $scope.graph
		});

		var $app = $('#content');

    $scope.paperScroller = new joint.ui.PaperScroller({
        autoResizePaper: true,
        paper: $scope.paper
    });

		$scope.paper.on('blank:pointerdown', $scope.paperScroller.startPanning);

		$app.append($scope.paperScroller.render().el);

		$scope.graph.on('remove', function(cell) {
    	console.log('New cell with id ' + cell.id + ' removed to the graph.');
		})

		var selection = new Backbone.Collection;
		var selectionView = new joint.ui.SelectionView({ paper: $scope.paper, graph: $scope.graph , model: selection });

		$scope.paper.on('blank:pointerdown', function(evt){
			if (evt.shiftKey) {
				selectionView.startSelecting(evt);
			}
		});

		selection.on('reset add', function() {
        // Print types of all the elements in the selection.
        $('#selection-info').text('Selected types: ' + selection.pluck('type'));
    });

		$scope.paper.on('cell:pointerup', function(cellView, evt, x, y) {

			if (cellView.model instanceof joint.dia.Link) return;

			var halo = new joint.ui.Halo({
				cellView: cellView,
				boxContent: false
			});

			halo.on('action:link:add', function(link) {

			});

			halo.on('action:removeElement:pointerdown', function(link) {

			});

			// if (cs.isAttribute(cellView.model) || cs.isExtension(cellView.model)) {
			// 	halo.removeHandle('resize');
			// }

			halo.removeHandle('clone');
			halo.removeHandle('fork');
			halo.removeHandle('rotate');
			halo.render();
		});

		$scope.paper.on('blank:pointerdown', function(evt, x, y) {

		});

		$scope.paper.on('link:options', function (evt, cellView, x, y) {

    });

		var stencil = new joint.ui.Stencil({
			graph: $scope.graph,
			paper: $scope.paper
		});

		$('#stencil-holder').append(stencil.render().el);

		stencil.load([
			LogicFactory.createTable()
		]);

	}



});

// graph.on('remove', function(cell, collection, opt) {
//    if (cell.isLink()) {
//       // a link was removed  (cell.id contains the ID of the removed link)
//    }
// })

// .link-tools .tool-remove { display: none }
// .link-tools .tool-options { display: none }
