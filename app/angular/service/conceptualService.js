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

	return {
		isEntity : _isEntity,
		isAttribute : _isAttribute,
		isExtension : _isExtension
	}

});