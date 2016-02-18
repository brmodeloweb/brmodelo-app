angular.module('myapp').controller("conceptualController", function($scope, $http, $rootScope, $stateParams, ConceptualFactory, ModelAPI) {

	$scope.editionVisible = false;
	$scope.selectedElement = {
		element: {},
		value: ""
	};

	$scope.initView = function(){
		buildWorkspace()
	}

	$scope.applyChanges = function(){
		$scope.selectedElement.element.model.attributes.attrs.text.text = $scope.selectedElement.value;
		$scope.selectedElement.element.update();
	}

	$scope.changeVisible = function(){
		$scope.editionVisible = !$scope.editionVisible;
	}

	$scope.saveModel = function()  {
		$scope.model = {
			name: 'mymodel',
			type: 'conceptual',
			model: JSON.stringify($scope.graph),
			user: $rootScope.loggeduser
		}

		ModelAPI.saveModel($scope.model).then(function(res){
			console.log(res);
		});
	}

	$scope.set = function(cellView) {
		$scope.selectedElement.value = cellView.model.attributes.attrs.text.text;
		$scope.selectedElement.element = cellView;
		$scope.$apply();
	}

	function buildWorkspace(){
		$scope.graph = new joint.dia.Graph;
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

		paper.on('cell:pointerup', function(cellView) {
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
