angular.module('myapp')
			 .controller("conceptualController",
				function($scope,
								 $http,
								 $window,
								 $rootScope,
								 $stateParams,
								 ConceptualFactory,
								 ConceptualService,
								 ModelAPI) {

	var cs = ConceptualService;

	// how to resize
	$(window).resize(function(){
		var canvas = $('#content');
		$scope.paper.setDimensions(canvas.width(), canvas.height());
	});

	$scope.types = [{id: 1, txt: '(t, c)', type: 'conceptual'},
									{id: 2, txt: '(t, p)', type: 'conceptual'},
									{id: 3, txt: '(p, d)', type: 'conceptual'},
									{id: 4, txt: '(p, c)', type: 'conceptual'}];
							//  {txt: 'Lógico'   , type: 'Logic'}
	$scope.selected = $scope.types[0];

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
	$scope.isElementSelected = false;

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

		ModelAPI.updateModel($scope.model).then(function(res){
			// call feedback here
			console.log("saved");
		});
	}

	$scope.onSelectElement = function(cellView) {

		if(cellView.model.attributes.attrs.text != null){
			$scope.selectedElement.value = cellView.model.attributes.attrs.text.text;
			$scope.selectedElement.element = cellView;
			$scope.$apply();
		}

		if(cs.isEntity(cellView.model)){
			console.log('Entity Selected');
		}

	}

	var createLink = function(elm1, elm2) {
		var myLink = new joint.shapes.erd.Line({
			source: {
				id: elm1.id
			},
			target: {
				id: elm2.id
			}
		});
		return myLink.addTo($scope.graph);
	};

	$scope.isValidConnection = function (source, target, link) {
		if (cs.isEntity(source) && cs.isEntity(target)) {

			var x1 = source.attributes.position.x;
			var y1 = source.attributes.position.y;
			var x2 = target.attributes.position.x;
			var y2 = target.attributes.position.y;

			var x = (x1 + x2) / 2;
			var y = (y1 + y2) / 2;
			var isa = ConceptualFactory.createRelationship();

			link.remove();

			isa.attributes.position.x = x;
			isa.attributes.position.y = y;

			$scope.graph.addCell(isa);

			createLink(source, isa);
			createLink(target, isa);

			return true;
		}

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

		$scope.paper = new joint.dia.Paper({
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

		$scope.paper.on('cell:pointerup', function(cellView, evt) {

			$scope.onSelectElement(cellView);

			if (cellView.model instanceof joint.dia.Link) return;
			var halo = new joint.ui.Halo({
				cellView: cellView,
				boxContent: false
			});

			halo.on('action:link:add', function(link) {
				var source = $scope.graph.getCell(link.get('source').id);
				var target = $scope.graph.getCell(link.get('target').id);

				console.log(link);
				if(!$scope.isValidConnection(source, target, link)){
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

		$scope.paper.on('blank:pointerdown', function(evt, x, y) {
			$scope.selectedElement = {
				element: {},
				value: ""
			};
			$scope.$apply();
		});

		var stencil = new joint.ui.Stencil({
			graph: $scope.graph,
			paper: $scope.paper
		});

		$('#stencil-holder').append(stencil.render().el);

		stencil.load([
			ConceptualFactory.createEntity(),
			ConceptualFactory.createAttribute(),
			ConceptualFactory.createIsa(),
			ConceptualFactory.createRelationship(),
			ConceptualFactory.createKey(),
		]);
	}

});
