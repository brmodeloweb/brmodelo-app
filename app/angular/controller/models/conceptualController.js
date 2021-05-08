angular.module('myapp')
			 .controller("conceptualController",
				function(){

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
		} else {
			var neighbors = $scope.graph.getNeighbors(entity)
			for (var i = 0; i < neighbors.length; i++) {
				if (_isAttribute(neighbors[i])) {
					neighbors[i].remove();
				}
			}
		}

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

	$scope.changeDropdownVisible = function(){
		$scope.dropdownVisible = !$scope.dropdownVisible;
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

		if(cs.isRelationship(cellView.model) && cellView.model.attributes.type=="erd.Relationship") {
			$scope.entitySelected = "RELATIONSHIP";
		}

		$scope.$apply();
	}

	function buildWorkspace(){
		$scope.conectElements = function(cellView, x, y) {

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
				// All the four corners of the child are inside the parent area.
				return;
			}
			// Revert the child position.
			cell.set('position', cell.previous('position'));
		});

		$scope.paper.on('cell:pointerup', function(cellView, evt, x, y) {

			if (cellView.model instanceof joint.dia.Link) return;

			$scope.onSelectElement(cellView);

			//conect elementos ao jogar em cima
			if(x != null && y != null){
				$scope.conectElements(cellView, x, y)
			}

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
			if(!$scope.selectedElement.element.model.attributes.weak){
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

				$scope.$apply();
			}

	});

	}

});