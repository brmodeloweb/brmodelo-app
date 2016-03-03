angular.module('myapp').controller("conceptualController", function($scope, $http, $rootScope, $stateParams, ConceptualFactory, ModelAPI) {

	$scope.model = {
		id: '',
		name: 'mymodel',
		type: 'conceptual',
		model: '',
		user: $rootScope.loggeduser
	}
	$scope.editionVisible = false;
	$scope.dropdownVisible = false;
	$scope.selectedElement = {
		element: {},
		value: ""
	};

	$scope.initView = function(){
		buildWorkspace();

		checkLoading();
	}

	checkLoading = function(){

		if($stateParams.modelid == 0) {
			$scope.model.id = 0;
			return;
		}

		var json = {'modelId': $stateParams.modelid,
								'userId': $rootScope.loggeduser
								}

		ModelAPI.getModel($stateParams.modelid, $rootScope.loggeduser).then(function(resp){
			$scope.model.name = resp.data[0].name;
			$scope.model.type = resp.data[0].type;
			$scope.model.id   = resp.data[0]._id;
			$scope.graph.fromJSON(JSON.parse(resp.data[0].model));
		});

	}

	$scope.undoModel = function(){
		console.log("undo");
		$scope.commandManager.undo();
	}

	$scope.redoModel = function(){
		console.log("redo");
		$scope.commandManager.redo();
	}

	$scope.applyChanges = function(){
		$scope.selectedElement.element.model.attributes.attrs.text.text = $scope.selectedElement.value;
		$scope.selectedElement.element.update();
	}

	$scope.changeVisible = function(){
		$scope.editionVisible = !$scope.editionVisible;
	}

	$scope.changeDropdownVisible = function(){
		$scope.dropdownVisible = !$scope.dropdownVisible;
	}

	$scope.saveModel = function() {
		$scope.model.model = JSON.stringify($scope.graph);

		if ($scope.model.id == 0){
			ModelAPI.saveModel($scope.model).then(function(res){
				console.log(res);
			});
		} else {
			console.log($scope.model.name);
			ModelAPI.updateModel($scope.model).then(function(res){
				console.log(res);
			});
		}
	}

	$scope.set = function(cellView) {
		if(cellView.model.attributes.attrs.text != null){
			$scope.selectedElement.value = cellView.model.attributes.attrs.text.text;
			$scope.selectedElement.element = cellView;
			$scope.$apply();
		}
	}

	function buildWorkspace(){
		$scope.graph = new joint.dia.Graph;
		$scope.commandManager = new joint.dia.CommandManager({ graph: $scope.graph });

		var paper = new joint.dia.Paper({
			el: $('#content'),
			width: $('#content').width(),
			height: $('#content').height(),
			gridSize: 1,
			model: $scope.graph,
			linkPinning: false,
			markAvailable: true,
			restrictTranslate: true,
			linkConnectionPoint: joint.util.shapePerimeterConnectionPoint
		});

		var selection = new Backbone.Collection;
		var selectionView = new joint.ui.SelectionView({ paper: paper, graph: $scope.graph , model: selection });

		paper.on('blank:pointerdown', function(evt){
			if (evt.shiftKey) {
				selectionView.startSelecting(evt);
			}
		});

		selection.on('reset add', function() {
        // Print types of all the elements in the selection.
        $('#selection-info').text('Selected types: ' + selection.pluck('type'));
    });

		paper.on('cell:pointerup', function(cellView, evt) {
			console.log("entity");
			console.log(cellView);
			$scope.set(cellView);
			if (cellView.model instanceof joint.dia.Link) return;
			var halo = new joint.ui.Halo({
				cellView: cellView,
				boxContent: false
			});

			halo.removeHandle('resize');
			halo.removeHandle('clone');
			halo.removeHandle('fork');
			halo.removeHandle('rotate');
			halo.render();
		});

		paper.on('blank:pointerdown', function(evt, x, y) {
			console.log("unselected");
			$scope.selectedElement = {
				element: {},
				value: ""
			};
			$scope.$apply();
		});

		var stencil = new joint.ui.Stencil({
			graph: $scope.graph,
			paper: paper
		});

		$('#stencil-holder').append(stencil.render().el);

		stencil.load([
			ConceptualFactory.createEntity(),
			ConceptualFactory.createAttribute(),
			ConceptualFactory.createIsa(),
			ConceptualFactory.createKey(),
			ConceptualFactory.createRelationship(),
			ConceptualFactory.createMultivalued(),
			ConceptualFactory.createWeakEntity(),
			ConceptualFactory.createWeakEntity(),
			ConceptualFactory.createDerived(),
			ConceptualFactory.createIdentifyingRelationship()
		]);
	}

});
