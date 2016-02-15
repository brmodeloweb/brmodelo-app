angular.module('myapp').controller("conceptualController", function($scope, $http, $rootScope, ConceptualFactory, ModelAPI) {

	$scope.editionVisible = false;

	$scope.applyChanges = function(){
		$scope.selectedElement.element.model.attributes.attrs.text.text = $scope.selectedElement.value;
		$scope.selectedElement.element.update();
	}

	$scope.selectedElement = {
		element: {},
		value: ""
	};

	$scope.changeVisible = function(){
		$scope.editionVisible = !$scope.editionVisible;
	}

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

	$scope.set = function(cellView) {
		$scope.selectedElement.value = cellView.model.attributes.attrs.text.text;
		$scope.selectedElement.element = cellView;
		$scope.$apply();
	}

	var stencil = new joint.ui.Stencil({
		graph: $scope.graph,
		paper: paper
	});
	$('#stencil-holder').append(stencil.render().el);

	var entity = ConceptualFactory.createEntity();
	var attribute = ConceptualFactory.createAttribute();
	var isa = ConceptualFactory.createIsa();
	var key = ConceptualFactory.createKey();
	var relationship = ConceptualFactory.createRelationship();
	var multivalued = ConceptualFactory.createMultivalued();
	var weakEntity = ConceptualFactory.createWeakEntity();
	var derived = ConceptualFactory.createDerived();
	var identifyingRelationship = ConceptualFactory.createIdentifyingRelationship();

	stencil.load([entity, attribute, isa, key, relationship,
		multivalued, derived, weakEntity, identifyingRelationship
	]);

});
