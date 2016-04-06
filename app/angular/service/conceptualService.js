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

	return {
		isEntity : _isEntity,
		isAttribute : _isAttribute,
		isExtension : _isExtension,
		updateExtension : _updateExtension
	}

});