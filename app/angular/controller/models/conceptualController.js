angular.module('myapp')
			 .controller("conceptualController",
				function($scope,
								 $http,
								 $window,
								 $state,
								 $rootScope,
								 $stateParams,
								 ConceptualFactory,
								 ConceptualService,
								 ConversorService,
								 ModelAPI,
							 	$timeout) {

	var cs = ConceptualService;

	var baseX = 0;
	var baseY = 0;

	$scope.entitySelected = "NONE";
	$scope.extensionSelected = "Selecione";
	$scope.cardSelected = "Selecione";
	$scope.attributeCardSelected = "Selecione";
	$scope.roleSelected = "";

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

	$scope.feedback = {
		message: "",
		showing: false
	}

	$scope.showFeedback =  function(newMessage, show){
		$scope.feedback.message = newMessage;
		$scope.feedback.showing = show;
	}

	$scope.print = function(){
		window.print();
	}

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
			if(updated == null){
				$scope.selectedElement.element.model.attributes.isExtended = false;
				$scope.call(selected);
			} else {
				updated.findView($scope.paper).update();
				$scope.extensionSelected = selected;
			}
		}
	}

	$scope.updateCard = function(selected){
		$scope.selectedElement.element.model.label(0,
			{ position: 0.3,
				attrs: { text: { text: selected}}
			});
	}

	$scope.updateAttributeCard = function(selected) {
		var text = $scope.selectedElement.value;

		if(selected != '(1, 1)'){
			text = text + " " + selected;
		}

		$scope.selectedElement.element.model.attributes.attrs.text.text = text;
		$scope.selectedElement.element.model.attributes.cardinality = selected;
		$scope.attributeCardSelected = selected;
		$scope.selectedElement.element.update();
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

				rel.attributes.position.x = entity.attributes.position.x + 150;
				rel.attributes.position.y = entity.attributes.position.y;

				$scope.graph.addCell(rel);

				var u = createLink(entity, rel);
				u.set('vertices', [{ x: entity.attributes.position.x + 120, y: entity.attributes.position.y - 10}]);

				var d = createLink(entity, rel);
				d.set('vertices', [{ x: entity.attributes.position.x + 120, y: entity.attributes.position.y + 60}]);

				rel.attributes.autorelationship = true;

			}
		} else {
			cs.getAutoRelationship(entity, $scope.graph.getNeighbors(entity)).remove();
		}

	}

	$scope.createAssociative = function() {
		var entity = $scope.selectedElement.element.model;
		if(entity.attributes.parent == null){
			var block = ConceptualFactory.createBlockAssociative();
			block.attributes.position.x = entity.attributes.position.x - 6;
			block.attributes.position.y = entity.attributes.position.y - 2;

			$scope.graph.addCell(block);

			block.embed(entity);
			entity.toFront();
		}
	}

	$scope.composedChange = function() {
		var entity = $scope.selectedElement.element.model;

		if(entity.attributes.composed) {
		//	if(!cs.hasAttributeNeighbors(entity, $scope.graph.getNeighbors(entity))){
				var attr1 = ConceptualFactory.createAttribute();
				attr1.attributes.attrs.text.text = "attr1";
				attr1.attributes.position.x = entity.attributes.position.x + 50;
				attr1.attributes.position.y = entity.attributes.position.y + 20;
				$scope.graph.addCell(attr1);
				createLink(entity, attr1);

				var attr2 = ConceptualFactory.createAttribute();
				attr2.attributes.attrs.text.text = "attr2";
				attr2.attributes.position.x = entity.attributes.position.x + 50;
				attr2.attributes.position.y = entity.attributes.position.y - 20 ;
				$scope.graph.addCell(attr2);
				createLink(entity, attr2);
	//		}
		} else {
			var neighbors = $scope.graph.getNeighbors(entity)
			for (var i = 0; i < neighbors.length; i++) {
				if (_isAttribute(neighbors[i])) {
					neighbors[i].remove();
				}
			}
		}

	}

	$scope.initView = function(){
		buildWorkspace();

		$scope.showLoading(true);

		ModelAPI.getModel($stateParams.modelid, $rootScope.loggeduser).then(function(resp){
			$scope.model.name = resp.data[0].name;
			$scope.model.type = resp.data[0].type;
			$scope.model.id   = resp.data[0]._id;
			$scope.graph.fromJSON(JSON.parse(resp.data[0].model));
			$scope.showLoading(false);
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

	$scope.applyChanges = function() {
		if($scope.selectedElement.element != null &&
			$scope.selectedElement.element.model != null &&
			$scope.selectedElement != null &&
			$scope.selectedElement.element.model.attributes.attrs != null &&
			$scope.selectedElement.element.model.attributes.attrs.text != null &&
			$scope.selectedElement.element.model.attributes.attrs.text.text !=
			$scope.selectedElement.value &&
			$scope.selectedElement.value != ""
		  ){

			var text = $scope.selectedElement.value

			if($scope.entitySelected == "Attribute"){
				var cardinality = $scope.selectedElement.element.model.attributes.cardinality;
				if(cardinality != '(1, 1)'){
					text = text + " " + cardinality;
				}
			}

			$scope.selectedElement.element.model.attributes.attrs.text.text = text;
			$scope.selectedElement.element.update();
		}
	}

	$scope.applyRoleChange = function() {
		if($scope.entitySelected == "LINK"){
			$scope.selectedElement.element.model.label(1,
				{ position: 0.7,
					attrs: { text: { text: $scope.roleSelected}}
				});

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
			$scope.showFeedback("Salvo com sucesso!", true);
			console.log("saved");
		});
	}

	$scope.convertModel = function() {

		var model = {
			"name": $scope.model.name+"_convertido",
			"user": $rootScope.loggeduser,
			"type": "logic",
			"model": '{"cells":[]}'
		};

		ModelAPI.saveModel(model).then(function(newModel){
			window.open($state.href('logic', {'modelid': newModel._id, 'conversionId': $scope.model.id}),  '_blank');
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
			$scope.attributeCardSelected = cellView.model.attributes.cardinality;
			if(cellView.model.attributes.attrs.text != null && !cs.isExtension(cellView.model)){
				var text = cellView.model.attributes.attrs.text.text;
				$scope.selectedElement.value = text.replace(/ *\([^)]*\) */g, "");
			}
		}

		if(cs.isKey(cellView.model)) {
			$scope.entitySelected = "KEY";
		}

		console.log(cellView.model);
		if(cs.isRelationship(cellView.model) && cellView.model.attributes.type=="erd.Relationship") {
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

		return myLink;
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

					if (cs.isEntity(source)) {
						if(target.attributes.parentId == null){
							target.attributes.parentId = source.id;
						}
					} else {
						if(source.attributes.parentId == null){
							source.attributes.parentId = target.id;
						}
					}

				if(target.attributes.isExtended || source.attributes.isExtended) {
				//	return false;
				} else {
					if (cs.isEntity(source)) {
						source.attributes.isExtended = true;
						console.log(target);
					} else {
						target.attributes.isExtended = true;
						console.log(source);
					}
					return true;
				}

		}

		if(cs.isAttribute(source) && cs.isAttribute(target)){
			if($scope.graph.getNeighbors(source).length > 1) {
				source.attributes.composed = true;
				return true;
			}

			if($scope.graph.getNeighbors(target).length > 1) {
				target.attributes.composed = true;
				return true;
			}

			if(source.attributes.composed || target.attributes.composed){
				return true;
			}

			return false;
		}

		if(cs.isAttribute(source) || cs.isAttribute(target)) {
			if(cs.isExtension(source) || cs.isExtension(target)){
				return false;
			} else {

					if(cs.isEntity(source) || cs.isEntity(target)){
						return true;
					}

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

			// if(cs.isRelationship(source) && source.attributes.autorelationship){
			// 	return false;
			// }
			//
			// if(cs.isRelationship(target) && target.attributes.autorelationship){
			// 	return false;
			// }
			//
			// if(cs.isAssociative(target) || cs.isAssociative(source)){
			// 	return true;
			// }
		}

		if(source.attributes.supertype === target.attributes.supertype)
			return false;

		console.log("Returnig true");
		return true;
	}

	function onLink(link) {

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
		//	el: $('#content'),
			//width: 1000,
			//height: 1000,
			width: $('#content').width(),
			height: $('#content').height(),
			gridSize: 10,
			drawGrid: true,
			model: $scope.graph,
			//linkPinning: false,
			//markAvailable: true,
			//restrictTranslate: true,
			linkConnectionPoint: joint.util.shapePerimeterConnectionPoint
			// multiLinks: false
		});

		var $app = $('#content');

    $scope.paperScroller = new joint.ui.PaperScroller({
			paper: $scope.paper,
			cursor: 'grab',
			autoResizePaper: true
    });

		$app.append($scope.paperScroller.render().el);

		$(window).resize(function() {
    	var canvas = $('#content');
			console.log("#content");
			console.log(canvas.width());
			console.log(canvas.height());

			var paper = $('.paper-scroller');
			console.log(".paper-scroller");
			console.log(paper.width());
			console.log(paper.height());

			var jointpaper = $('.joint-paper');
			console.log(".joint-theme-default.joint-paper");
			console.log(jointpaper.width());
			console.log(jointpaper.height());
			console.log(jointpaper);
    //	$scope.paper.setDimensions(canvas.width(), canvas.height());
		});

		var stencil = new joint.ui.Stencil({
			graph: $scope.graph,
			paper: $scope.paper
		//	scaleClones: true
		});

		$('#stencil-holder').append(stencil.render().el);

		stencil.load([
			ConceptualFactory.createEntity(),
			ConceptualFactory.createAttribute(),
			ConceptualFactory.createIsa(),
			ConceptualFactory.createRelationship(),
			ConceptualFactory.createKey(),
			ConceptualFactory.createAssociative(),
			ConceptualFactory.createComposedAttribute()
		]);

		// paperScroller.$el.css({
		// 		width: $('#paper-holder').width(),
		// 		height: $('#paper-holder').height()
		// 		width: 500,
		// 		height: 500
		// });

		$scope.conectElements = function(cellView, x, y) {

			console.log("connect elements: ", cellView);

			var elementBelow = $scope.graph.get('cells').find(function(cell) {
					if (cellView.model.attributes.parent != null) return false;
					if (cell instanceof joint.dia.Link) return false; // Not interested in links
					if (cellView.model.attributes.embeds != null){
						if (cell.id === cellView.model.attributes.embeds[0]) return false;
					}
					if (cell.id === cellView.model.id) return false; // The same element as the dropped one.
					if (cell.getBBox().containsPoint(g.point(x, y))) {
							return true;
					}
					return false;
			});

			// If the two elements are connected already, don't
			// connect them again (this is application specific though).
			console.log("conectElements", elementBelow);

			if (elementBelow && !_.contains($scope.graph.getNeighbors(elementBelow), cellView.model) &&
					!cs.isAssociative(elementBelow) &&
					!cs.isComposedAttribute(elementBelow)) {
					console.log("connetinnng");
					createLink(cellView.model, elementBelow);
					// Move the element a bit to the side.
					cellView.model.translate(100, 0);
			}
		}

		$scope.graph.on('add', function(cell) {

			// Connectando elementos ao realizar drop
			var cellView = $scope.paper.findViewByModel(cell);
			if (cellView.model instanceof joint.dia.Link) return;

			if(cs.isAssociative(cellView.model)) {

				var block = ConceptualFactory.createBlockAssociative();
				block.attributes.position.x = cellView.model.attributes.position.x;
				block.attributes.position.y = cellView.model.attributes.position.y;

				var auto = ConceptualFactory.createRelationship();
				auto.attributes.position.x = block.attributes.position.x + 6;
				auto.attributes.position.y = block.attributes.position.y + 2;

				cellView.model.remove();
				$scope.graph.removeCells(cellView);
				$scope.graph.addCell(block);
				$scope.graph.addCell(auto);

				block.embed(auto);
			}

			if(cs.isComposedAttribute(cellView.model)) {

				var x = cellView.model.attributes.position.x;
				var y = cellView.model.attributes.position.y;
				cellView.model.remove();

				$timeout(function(){
					var base = ConceptualFactory.createAttribute();
					base.attributes.position.x = x + 15;
					base.attributes.position.y = y + 15;
					base.attributes.composed = true;
					$scope.graph.addCell(base);

					var attr1 = ConceptualFactory.createAttribute();
					attr1.attributes.attrs.text.text = "attr1";
					attr1.attributes.position.x = base.attributes.position.x + 50;
					attr1.attributes.position.y = base.attributes.position.y + 20;
					$scope.graph.addCell(attr1);
					createLink(base, attr1);

					var attr2 = ConceptualFactory.createAttribute();
					attr2.attributes.attrs.text.text = "attr2";
					attr2.attributes.position.x = base.attributes.position.x + 50;
					attr2.attributes.position.y = base.attributes.position.y - 20 ;
					$scope.graph.addCell(attr2);
					createLink(base, attr2);

				}, 100);

			//	$scope.graph.addCell(base);
			//	createLink(entity, attr1);



				// $scope.graph.addCell(block);
				// $scope.graph.addCell(auto);

			}

			if(cellView != null && (cs.isAttribute(cell) || cs.isKey(cell))){
				var x = cellView.model.attributes.position.x;
				var y = cellView.model.attributes.position.y;
				if(x != null && y != null){
					$scope.conectElements(cellView, x, y);
				}
			}
	  });

		$scope.graph.on('change:position', function(cell) {

	    var parentId = cell.get('parent');
	    if (!parentId) return;

	    var parent = $scope.graph.getCell(parentId);
	    var parentBbox = parent.getBBox();
	    var cellBbox = cell.getBBox();

	    if (parentBbox.containsPoint(cellBbox.origin()) &&
	        parentBbox.containsPoint(cellBbox.topRight()) &&
	        parentBbox.containsPoint(cellBbox.corner()) &&
	        parentBbox.containsPoint(cellBbox.bottomLeft())) {

	        // All the four corners of the child are inside
	        // the parent area.
	        return;
	    }
	    // Revert the child position.
	    cell.set('position', cell.previous('position'));
		});


		$scope.graph.on('remove', function(cell) {
			console.log('New cell with id ' + cell.id + ' removed to the graph.');
		})

		var selection = new Backbone.Collection;
		var selectionView = new joint.ui.SelectionView({ paper: $scope.paper, graph: $scope.graph , model: selection });

		$scope.paper.on('blank:pointerdown', function(evt) {
			if (evt.shiftKey) {
				selectionView.startSelecting(evt);
			} else {
				$scope.paperScroller.startPanning;
			}
		});

		$scope.paper.on('cell:pointerup', function(cellView, evt, x, y) {

			if (cellView.model instanceof joint.dia.Link) return;

			$scope.onSelectElement(cellView);

			//conect elementos ao jogar em cima
			if(x != null && y != null){
				$scope.conectElements(cellView, x, y)
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
			$scope.showFeedback("",false);
			$scope.selectedElement = {
				element: {},
				value: ""
			};
			$scope.roleSelected = "";
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
			$scope.selectedElement.element.update();
		}

		$scope.paper.on('link:options', function (cellView, evt, x, y) {

			console.log("Selecting links...");

			var source = $scope.graph.getCell(cellView.model.get('source').id);
			var target = $scope.graph.getCell(cellView.model.get('target').id);

			if((cs.isRelationship(source) || cs.isRelationship(target)) &&
			   (cs.isEntity(source) || cs.isEntity(target))) {

				if(cellView.model.attributes.labels != null){
					$scope.cardSelected = cellView.model.attributes.labels[0].attrs.text.text;

					$scope.roleSelected = "";
					if(cellView.model.attributes.labels[1] != null) {
						$scope.roleSelected = cellView.model.attributes.labels[1].attrs.text.text;
					}
				}

				$scope.entitySelected = "LINK";
				$scope.selectedElement.element = cellView;

				console.log($scope.entitySelected);

				$scope.$apply();
			}

    });

	}

});

// .link-tools .tool-remove { display: none }
// .link-tools .tool-options { display: none }
