angular.module('myapp').controller("conceptualController", function($scope, $http, ConceptualFactory) {

	$scope.editionVisible = false;

	$scope.changeVisible = function(){
		$scope.editionVisible = !$scope.editionVisible;
	}

	var graph = new joint.dia.Graph;
	var paper = new joint.dia.Paper({
		el: $('#content'),
		width: $('#content').width(),
		height: $('#content').height(),
		gridSize: 1,
		model: graph,
		linkPinning: false,
		markAvailable: true,
		restrictTranslate: true,
		linkConnectionPoint: joint.util.shapePerimeterConnectionPoint,
	});

	paper.on('cell:pointerup', function(cellView) {
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
		graph: graph,
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
