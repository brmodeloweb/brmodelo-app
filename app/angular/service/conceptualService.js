import angular from "angular";

const conceptualService = () => {

	const _updateExtension = function (elements, text) {
		for (var i = 0; i < elements.length; i++) {
			if (_isExtension(elements[i])) {
				elements[i].attributes.attrs.text.text = text;
				return elements[i];
			}
		}
	};

	const _getExtensionTxt = function (entity, neighbors) {
		if (entity.attributes.isExtended) {
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

	const _getAutoRelationship = function (entity, neighbors) {
		for (var i = 0; i < neighbors.length; i++) {
			if (_isRelationship(neighbors[i]) && neighbors[i].attributes.autorelationship) {
				return neighbors[i];;
			}
		}
		return null;
	};

	const _hasAttributeNeighbors = function (entity, neighbors) {
		for (var i = 0; i < neighbors.length; i++) {
			if (_isAttribute(neighbors[i])) {
				return true;
			}
		}
		return false;
	}

	return {
		getAutoRelationship: _getAutoRelationship,
		updateExtension: _updateExtension,
		getExtensionTxt: _getExtensionTxt,
		hasAttributeNeighbors: _hasAttributeNeighbors,
	}

};

export default angular
	.module("app.ConceptualService", [])
	.factory("ConceptualService", conceptualService).name;
