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

	$scope.entitySelected = false;
	$scope.extensionSelected = "Selecione";

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

	$scope.call = function(selected) {

		if(!$scope.selectedElement.element.model.attributes.isExtended) {

			var x = $scope.selectedElement.element.model.attributes.position.x;
			var y = $scope.selectedElement.element.model.attributes.position.y;

			var isa = ConceptualFactory.createIsa();
			var entity = ConceptualFactory.createEntity();

			isa.attributes.position.x = x + 18 ;
			isa.attributes.position.y = y + 60;
			isa.attributes.attrs.text.text = selected;

			entity.attributes.position.x = x;
			entity.attributes.position.y = y + 120;

			$scope.graph.addCell(isa);
			$scope.graph.addCell(entity);

			createLink(isa, $scope.selectedElement.element.model);

			$scope.selectedElement.element.model.attributes.isExtended = true;
			isa.attributes.parentId = $scope.selectedElement.element.model.attributes.id;

			createLink(isa, entity);

			$scope.extensionSelected = selected;

		} else {
			var updated = ConceptualService.updateExtension($scope.graph.getNeighbors($scope.selectedElement.element.model), selected);
			updated.findView($scope.paper).update();
			$scope.extensionSelected = selected;
		}
	}

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
		if($scope.selectedElement.element != null &&
			$scope.selectedElement.element.model != null &&
			$scope.selectedElement != null &&
			$scope.selectedElement.element.model.attributes.attrs.text.text !=
			$scope.selectedElement.value){
			$scope.selectedElement.element.model.attributes.attrs.text.text = $scope.selectedElement.value;
			$scope.selectedElement.element.update();
		}
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

		if(cellView.model.attributes.attrs.text != null && !cs.isExtension(cellView.model)){
			$scope.selectedElement.value = cellView.model.attributes.attrs.text.text;
			$scope.selectedElement.element = cellView;
		} else {
			$scope.selectedElement.value = "";
			$scope.selectedElement.element = null;
		}

		if(cs.isEntity(cellView.model)) {

			$scope.extensionSelected = cs.getExtensionTxt(cellView.model, $scope.graph.getNeighbors(cellView.model));
			$scope.entitySelected = true;
			$scope.$apply();

		} else {
			$scope.entitySelected = false;
		}

		$scope.$apply();

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
		myLink.addTo($scope.graph);
		onLink(myLink);
	};

	$scope.isValidConnection = function (source, target, link) {

		if (!link.get('source').id || !link.get('target').id) {
				return false;
		}

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

		if ((cs.isEntity(source) && cs.isExtension(target)) ||
				(cs.isEntity(target) && cs.isExtension(source))) {

				if(target.attributes.isExtended || source.attributes.isExtended) {
					return false;
				} else {
					if (cs.isEntity(source)) {
						source.attributes.isExtended = true;
					} else {
						target.attributes.isExtended = true;
					}
					return true;
				}

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

	function onLink(link) {

		var source = $scope.graph.getCell(link.get('source').id);
		var target = $scope.graph.getCell(link.get('target').id);

		if(!$scope.isValidConnection(source, target, link)){
			link.remove();
		}

		if(source.attributes.supertype === 'Relationship' ||
			 target.attributes.supertype === 'Relationship') {

			// link.label(0, {
			// 	position: .1,
			// 	attrs: {
			// 		rect: { fill: 'transparent' },
			// 		text: { fill: 'blue', text: '1' }
			// 	}
			// });

		}
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
			// multiLinks: false
		});

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

			$scope.onSelectElement(cellView);

			if(x != null && y != null){
			// Find the first element below that is not a link nor the dragged element itself.
		    var elementBelow = $scope.graph.get('cells').find(function(cell) {
		        if (cell instanceof joint.dia.Link) return false; // Not interested in links.
		        if (cell.id === cellView.model.id) return false; // The same element as the dropped one.
		        if (cell.getBBox().containsPoint(g.point(x, y))) {
		            return true;
		        }
		        return false;
		    });

		    // If the two elements are connected already, don't
		    // connect them again (this is application specific though).
		    if (elementBelow && !_.contains($scope.graph.getNeighbors(elementBelow), cellView.model)) {

						createLink(cellView.model, elementBelow);
		        // Move the element a bit to the side.
		        cellView.model.translate(100, 0);
		    }
			}

			if (cellView.model instanceof joint.dia.Link) return;
			var halo = new joint.ui.Halo({
				cellView: cellView,
				boxContent: false
			});

			halo.on('action:link:add', function(link) {
				console.log("onlink");
				onLink(link);
			});

			halo.on('action:removeElement:pointerdown', function(link) {
				console.log("removing....");
			});

			if (cs.isAttribute(cellView.model) || cs.isExtension(cellView.model)) {
				halo.removeHandle('resize');
			}

			halo.removeHandle('clone');
			halo.removeHandle('fork');
			halo.removeHandle('rotate');
			halo.render();
		});

		$scope.paper.on('blank:pointerdown', function(evt, x, y) {

			$scope.applyChanges();
			$scope.selectedElement = {
				element: {},
				value: ""
			};

			$scope.entitySelected = false;

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
