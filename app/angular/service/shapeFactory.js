import angular from "angular";
import shapes from "../../joint/shapes"

const shapeFactory = function () {

	const createEntity = (customConfig) => {
		return new shapes.Entity(customConfig);
	};

	const createRelationship = (customConfig) => {
		return new shapes.Relationship(customConfig);
	};

	const createIsa = (customConfig) => {
		return new shapes.Isa(customConfig);
	};

	const createAssociative = (customConfig) => {
		return new shapes.Associative(customConfig)
	};

	const createAttribute = (customConfig) => {
		return new shapes.Attribute(customConfig);
	};

	const createKey = (customConfig) => {
		return new shapes.Key(customConfig);
	};

	const _createBlockAssociative = function () {
		return new erd.BlockAssociative({
			size: {
				width: 100,
				height: 50,
			},
			attrs: {
				".outer": {
					fill: "transparent",
					stroke: "black",
				},
			},
		});
	};

	const createComposedAttribute = function () {
		return new erd.ComposedAttribute({
			size: {
				width: 60,
				height: 60,
			},
			position: {
				x: 20,
				y: 320,
			},
			attrs: {
				image: { "xlink:href": "../../assets/img/composto-01.png" },
			},
		});
	};

	const createLink = (customConfig) => {
		return new shapes.Link(customConfig);
	};

	const isEntity = (element) => {
		return element.attributes.supertype === 'Entity';
	};

	const isAttribute = (element) => {
		return element.attributes.supertype === 'Attribute';
	};

	const isExtension = (element) => {
		return element.attributes.supertype === 'Inheritance';
	};

	const isRelationship = (element) => {
		return element.attributes.supertype === 'Relationship'
	};

	const isAssociative = (element) => {
		return element.attributes.type === 'erd.Associative'
	};

	const isKey = (element) => {
		return element.attributes.supertype === 'Key';
	};

	const isComposedAttribute = (element) => {
		return element.attributes.type === 'erd.ComposedAttribute';
	};

	return {
		createEntity,
		createAttribute,
		createIsa,
		createRelationship,
		createKey,
		createLink,
		createAssociative,
		//createComposedAttribute: _createComposedAttribute,
		isEntity, 
		isAttribute,
		isExtension,
		isRelationship,
		isAssociative,
		isKey, 
		isComposedAttribute
	};
};

export default angular
	.module("app.shapeFactory", [])
	.factory("ShapeFactory", shapeFactory).name;
