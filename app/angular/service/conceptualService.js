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

	return {
		isEntity : _isEntity,
		isAttribute : _isAttribute,
		isExtension : _isExtension,
		updateExtension : _updateExtension,
		getExtensionTxt: _getExtensionTxt
	}

});