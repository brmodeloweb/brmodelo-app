angular.module('myapp').factory('ConceptualService', function(){

		_isEntity = function(element) {
			return element.attributes.supertype === 'Entity';
		};

		_isAttribute = function(element) {
			return element.attributes.supertype === 'Attribute';
		};

		_isExtension = function(element) {
			return element.attributes.supertype === 'Inheritance';
		};

		_isRelationship = function(element) {
			return element.attributes.supertype === 'Relationship'
		};

		_isAssociative = function(element) {
			return element.attributes.type === 'erd.Associative'
		};

		_isKey = function(element) {
			return element.attributes.supertype === 'Key';
		};

		_isComposedAttribute = function(element) {
			return element.attributes.type === 'erd.ComposedAttribute';
		};

		_updateExtension = function(elements, text) {
			for (var i = 0; i < elements.length; i++) {
				if (_isExtension(elements[i])) {
					elements[i].attributes.attrs.text.text = text;
					return elements[i];
				}
			}
		};

		_getExtensionTxt = function(entity, neighbors) {
			if(entity.attributes.isExtended){
				for (var i = 0; i < neighbors.length; i++) {
					if (_isExtension(neighbors[i]) &&
						neighbors[i].attributes.parentId != null &&
						neighbors[i].attributes.parentId == entity.attributes.id) {
						return neighbors[i].attributes.attrs.text.text;
					}
				}
			}
			return "Selecione";
		};

		_getAutoRelationship = function(entity, neighbors) {
				for (var i = 0; i < neighbors.length; i++) {
					if (_isRelationship(neighbors[i]) && neighbors[i].attributes.autorelationship) {
						return neighbors[i];;
					}
				}
			return null;
		};

		_hasAttributeNeighbors = function(entity, neighbors) {
			for (var i = 0; i < neighbors.length; i++) {
				if (_isAttribute(neighbors[i])) {
					return true;
				}
			}
			return false;
		}

	return {
		isEntity : _isEntity,
		isAttribute : _isAttribute,
		isExtension : _isExtension,
	 	isRelationship : _isRelationship,
		getAutoRelationship : _getAutoRelationship,
		isAssociative: _isAssociative,
		updateExtension : _updateExtension,
		getExtensionTxt: _getExtensionTxt,
		isKey: _isKey,
		isComposedAttribute : _isComposedAttribute,
		hasAttributeNeighbors: _hasAttributeNeighbors,

	}

});
