export default class Validator {

	constructor() {}

	isEntity = (element) => {
		return element.attributes.supertype === 'Entity';
	};

	isAttribute = (element) => {
		return element.attributes.supertype === 'Attribute';
	};

	isExtension = (element) => {
		return element.attributes.supertype === 'Inheritance';
	};

	isRelationship = (element) => {
		return element.attributes.supertype === 'Relationship'
	};

	isAssociative = (element) => {
		return element.attributes.type === 'erd.Associative'
	};

	isBlockAssociative = (element) => {
		return element.attributes.type === 'erd.BlockAssociative';
	};

	isKey = (element) => {
		return element.attributes.supertype === 'Key';
	};

	isLink = (element) => {
		return element.attributes.type === 'erd.Link';
	};

	isNote = (element) => {
		return element.attributes.type === 'custom.Note';
	};

	isRelationshipFromBlockAssociative = (element) => {
		return this.isRelationship(element) && element.isEmbedded();
	}

	validateConversion = (graph) => {
		const errors = [];

		const cells = graph.attributes.cells.models;

		const entities = cells.filter(cell => this.isEntity(cell));
		if (entities.length === 0) {
			errors.push({type: "no_entity"});
		}

		const disconnectedElements = this._findDisconnectedElements(graph, cells);
		if (disconnectedElements.length > 0) {
			errors.push(...disconnectedElements);
		}

		const invalidRelationships = this._findInvalidRelationships(graph, cells);
		if (invalidRelationships.length > 0) {
			errors.push(...invalidRelationships);
		}

		const invalidExtensions = this._findInvalidExtensions(graph, cells);
		if (invalidExtensions.length > 0) {
			errors.push({type: "disconnected_extension"});
		}

		return {
			valid: errors.length === 0,
			errors: errors
		};
	};

	_findDisconnectedElements = (graph, cells) => {
		const errors = [];
		cells.forEach(cell => {
			if (this.isAttribute(cell) || this.isKey(cell)) {
				const links = graph.getConnectedLinks(cell);
				if (!links || links.length === 0) {
					const type = this._getElementType(cell);
					const name = this._getElementName(cell);
					errors.push({name: name, element_type: type, type: "disconnected_element"});
				}
			}
		});
		return errors;
	};

	_findInvalidRelationships = (graph, cells) => {
		const errors = [];
		cells.forEach(cell => {
			if (this.isRelationship(cell) && !this.isRelationshipFromBlockAssociative(cell)) {
				const links = graph.getConnectedLinks(cell);
				if (!links || links.length < 2) {
					const name = this._getElementName(cell);
					errors.push({name: name, type: "disconnected_relationship"});
				}
			}
		});
		return errors;
	};

	_findInvalidExtensions = (graph, cells) => {
		const invalid = [];
		cells.forEach(cell => {
			if (this.isExtension(cell)) {
				const links = graph.getConnectedLinks(cell);
				if (!links || links.length < 2) {
					invalid.push(cell);
				}
			}
		});
		return invalid;
	};

	_getElementType = (element) => {
		if (this.isEntity(element)) return "Entity";
		if (this.isAttribute(element)) return "Attribute";
		if (this.isKey(element)) return "Key";
		if (this.isRelationship(element)) return "Relationship";
		if (this.isExtension(element)) return "Extension";
		return "Element";
	};

	_getElementName = (element) => {
		const type = this._getElementType(element);
		if (type === "Entity") return element.attributes.name;
		if (type === "Attribute") return element.attributes.attrs.text.text;
		if (type === "Key") return element.attributes.attrs.text.text;
		if (type === "Relationship") return element.attributes.attrs.text.text;
		if (type === "Extension") return element.attributes.name;
		return "unnamed";
	};

}
