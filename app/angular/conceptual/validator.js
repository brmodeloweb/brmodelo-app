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

	isKey = (element) => {
		return element.attributes.supertype === 'Key';
	};

	isComposedAttribute = (element) => {
		return element.attributes.type === 'erd.ComposedAttribute';
	};

	isLink = (element) => {
		return element.attributes.type === 'erd.Link';
	};

}