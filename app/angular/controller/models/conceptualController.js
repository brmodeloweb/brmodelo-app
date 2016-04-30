angular.module('myapp')
			 .controller("conceptualController",
				function($scope,
								 $http,
								 $window,
								 $rootScope,
								 $stateParams,
								 ConceptualFactory,
								 ConceptualService,
								 ConversorService,
								 ModelAPI) {

	var cs = ConceptualService;

	// how to resize
	// $(window).resize(function(){
	// 	var canvas = $('#content');
	// 	$scope.paper.setDimensions(canvas.width(), canvas.height());
	// 	console.log("Resizing...");
	// });

	$scope.entitySelected = "NONE";
	$scope.extensionSelected = "Selecione";
	$scope.cardSelected = "Selecione";


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

	$scope.updateCard = function(selected){
		$scope.selectedElement.element.model.label(0,
			{ position: 0.3,
				attrs: { text: { text: selected}}
			});
	}

	$scope.updateExtension = function(selected){
		$scope.selectedElement.element.model.attributes.attrs.text.text = selected;
		$scope.selectedElement.element.update();
		$scope.extensionSelected = selected;
	}

	$scope.autoRelationshipChange = function(){
		var entity = $scope.selectedElement.element.model;

		if(entity.attributes.autorelationship) {
			if(cs.getAutoRelationship(entity, $scope.graph.getNeighbors(entity)) == null){
				var rel = ConceptualFactory.createRelationship();

				rel.attributes.position.x = entity.attributes.position.x + 100;
				rel.attributes.position.y = entity.attributes.position.y - 10;

				$scope.graph.addCell(rel);

				createLink(entity, rel);

				rel.attributes.autorelationship = true;
			}
		} else {
			cs.getAutoRelationship(entity, $scope.graph.getNeighbors(entity)).remove();
		}

	}

	$scope.initView = function(){
		buildWorkspace();

		ModelAPI.getModel($stateParams.modelid, $rootScope.loggeduser).then(function(resp){
			$scope.model.name = resp.data[0].name;
			$scope.model.type = resp.data[0].type;
			$scope.model.id   = resp.data[0]._id;
			$scope.graph.fromJSON(JSON.parse(resp.data[0].model));

	//		$scope.paperScroller.centerContent();
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

	$scope.applyChanges = function(){
		if($scope.selectedElement.element != null &&
			$scope.selectedElement.element.model != null &&
			$scope.selectedElement != null &&
			$scope.selectedElement.element.model.attributes.attrs != null &&
			$scope.selectedElement.element.model.attributes.attrs.text != null &&
			$scope.selectedElement.element.model.attributes.attrs.text.text !=
			$scope.selectedElement.value &&
			$scope.selectedElement.value != ""
		  ){

			$scope.selectedElement.element.model.attributes.attrs.text.text = $scope.selectedElement.value;

			$scope.selectedElement.element.update();

			console.log($scope.selectedElement.element.model.attributes.attrs.text);


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

	$scope.convertModel = function(){
		ConversorService.toLogic($scope.graph);
	}

	$scope.onSelectElement = function(cellView) {

		if(cellView.model.attributes.attrs.text != null && !cs.isExtension(cellView.model)){
			$scope.selectedElement.value = cellView.model.attributes.attrs.text.text;
			$scope.selectedElement.element = cellView;
		} else {
			$scope.selectedElement.value = "";
			$scope.selectedElement.element = null;
		}

		$scope.entitySelected = "NONE";

		if(cs.isEntity(cellView.model)) {
			$scope.extensionSelected = cs.getExtensionTxt(cellView.model, $scope.graph.getNeighbors(cellView.model));
			$scope.entitySelected = "ENTITY";
		}

		if(cs.isExtension(cellView.model)) {
			$scope.selectedElement.element = cellView;
			$scope.extensionSelected = cellView.model.attributes.attrs.text.text;
			$scope.entitySelected = "EXTENSION";
		}

		if(cs.isAttribute(cellView.model)) {
			$scope.entitySelected = "Attribute";
		}

		if(cs.isRelationship(cellView.model)) {
			$scope.entitySelected = "RELATIONSHIP";
		}

		$scope.$apply();

	}

	var createLink = function(elm1, elm2) {
		console.log("createLink");
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

		if(cs.isAttribute(source) && cs.isAttribute(target)){
			if(source.attributes.composed || target.attributes.composed){
				return true;
			} else {
				return false;
			}
		}

		if(cs.isAttribute(source) || cs.isAttribute(target)){
			if(cs.isExtension(source) || cs.isExtension(target)){
				return false;
			} else {
					if(cs.isAttribute(source) && $scope.graph.getNeighbors(source).length > 1) {
						return false;
					}

					if(cs.isAttribute(target) && $scope.graph.getNeighbors(target).length > 1) {
						return false;
					}

					// 	if(source.attributes.supertype != 'Entity'){
					// 		return false;
					// 	}
				return true;
			}
		}

		if(cs.isRelationship(source) || cs.isRelationship(target)){
			if(cs.isRelationship(source) && source.attributes.autorelationship){
				return false;
			}

			if(cs.isRelationship(target) && target.attributes.autorelationship){
				return false;
			}
		}

		if(source.attributes.supertype === target.attributes.supertype)
			return false;

		return true;
	}

	function onLink(link) {


		console.log("onLink");
		var source = $scope.graph.getCell(link.get('source').id);
		var target = $scope.graph.getCell(link.get('target').id);

		if(!$scope.isValidConnection(source, target, link)){
			link.remove();
		}

		if((source.attributes.supertype === 'Relationship' ||
			 target.attributes.supertype === 'Relationship') &&
		   (cs.isEntity(source) || cs.isEntity(target))) {

			 var pos = 0.3;

			 if(cs.isEntity(target)){
				 pos = 0.7;
			 }

			 link.label(0, { position: pos, attrs: { text: { text: '(0, n)'}}});

		}
	}

	function buildWorkspace(){
		$scope.graph = new joint.dia.Graph;
		$scope.commandManager = new joint.dia.CommandManager({ graph: $scope.graph });

		$scope.paper = new joint.dia.Paper({
			//el: $('#content'),
			//width: $('#content').width(),
			//height: $('#content').height(),
			width: $('#content').width(),
			height: $('#content').height(),
			gridSize: 1,
			model: $scope.graph,
			//linkPinning: false,
			//markAvailable: true,
			//restrictTranslate: true,
			linkConnectionPoint: joint.util.shapePerimeterConnectionPoint
			// multiLinks: false
		});

		var $app = $('#content');

    $scope.paperScroller = new joint.ui.PaperScroller({
        autoResizePaper: true,
    //    padding: 10,
        paper: $scope.paper
    });

		$scope.paper.on('blank:pointerdown', $scope.paperScroller.startPanning);

		// paperScroller.$el.css({
		// 		width: $('#paper-holder').width(),
		// 		height: $('#paper-holder').height()
		// 		width: 500,
		// 		height: 500
		// });

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

			$scope.onSelectElement(cellView);

			if(x != null && y != null){
			// Find the first element below that is not a link nor the dragged element itself.
		    var elementBelow = $scope.graph.get('cells').find(function(cell) {
			//			console.log(cell);
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

			$scope.entitySelected = 'NONE';

			$scope.$apply();

		});

		$scope.setWeak = function(){
			if($scope.selectedElement.element.model.attributes.weak){
				$scope.selectedElement.element.model.attributes.attrs = {
								'.connection': { stroke: 'black', 'stroke-width': 3}
							};
			} else {
				$scope.selectedElement.element.model.attributes.attrs = {
								'.connection': { stroke: 'black', 'stroke-width': 1}
							};
			}
			$scope.selectedElement.element .update();
		}

		$scope.paper.on('link:options', function (evt, cellView, x, y) {

			var source = $scope.graph.getCell(cellView.model.get('source').id);
			var target = $scope.graph.getCell(cellView.model.get('target').id);

			if((cs.isRelationship(source) || cs.isRelationship(target)) &&
			   (cs.isEntity(source) || cs.isEntity(target))) {

				if(cellView.model.attributes.labels != null){
					$scope.cardSelected = cellView.model.attributes.labels[0].attrs.text.text;
				}

				$scope.entitySelected = "LINK";
				$scope.selectedElement.element = cellView;

				$scope.$apply();
			}

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
			ConceptualFactory.createAssociative()
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
