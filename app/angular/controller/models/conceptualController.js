angular.module('myapp').controller("conceptualController",
	function($scope, $http, $rootScope, $stateParams, ConceptualFactory, ModelAPI) {

	$scope.model = {
		id: '',
		name: 'mymodel',
		type: 'conceptual',
		model: '',
		user: $rootScope.loggeduser
	}
	$scope.editionVisible = false;
	$scope.dropdownVisible = false;
	$scope.shouldShow = false;

	$scope.selectedElement = {
		element: {},
		value: ""
	};

	$scope.initView = function(){
		buildWorkspace();

		if($stateParams.modelid == 0)
			return;

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
				// call feedback here
			});
		} else {
			ModelAPI.updateModel($scope.model).then(function(res){
				// call feedback here
			});
		}
	}

	$scope.set = function(cellView) {
		if(cellView.model.attributes.attrs.text != null){

			if(cellView.model.attributes.supertype === 'Relationship'){
				treatRelationship(cellView);
			}

			$scope.selectedElement.value = cellView.model.attributes.attrs.text.text;
			$scope.selectedElement.element = cellView;
			$scope.$apply();
		}
	}

	treatRelationship = function (cellView) {

	}

	$scope.isValidConnection = function (source, target) {
		if(source.attributes.supertype === target.attributes.supertype)
			return false;

		if (source.attributes.supertype === 'Attribute') {
			if(target.attributes.supertype != 'Entity'){
				return false;
			}

			if($scope.graph.getNeighbors(source).length > 1) {
				return false;
			}
		}

		if (target.attributes.supertype === 'Attribute') {
			if(source.attributes.supertype != 'Entity'){
				return false;
			}

			if($scope.graph.getNeighbors(target).length > 1) {
				return false;
			}
		}
		return true;
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
			$scope.set(cellView);
			if (cellView.model instanceof joint.dia.Link) return;
			var halo = new joint.ui.Halo({
				cellView: cellView,
				boxContent: false
			});

			halo.on('action:link:add', function(link) {
				var source = $scope.graph.getCell(link.get('source').id);
				var target = $scope.graph.getCell(link.get('target').id);

				if(!$scope.isValidConnection(source, target)){
				  link.remove();
				}

				if(source.attributes.supertype === 'Relationship' ||
					 target.attributes.supertype === 'Relationship') {

					link.label(0, {
						position: .1,
						attrs: {
							rect: { fill: 'transparent' },
							text: { fill: 'blue', text: '1' }
						}
					});

				}

			});

			halo.removeHandle('resize');
			halo.removeHandle('clone');
			halo.removeHandle('fork');
			halo.removeHandle('rotate');
			halo.render();
		});

		paper.on('blank:pointerdown', function(evt, x, y) {
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
