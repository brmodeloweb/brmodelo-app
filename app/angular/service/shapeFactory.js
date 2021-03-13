import angular from "angular";
import * as joint from "jointjs";

const shapeFactory = function() {
	const erd = joint.shapes.erd;

	const _createEntity = function () {
		return new erd.Entity({
			position: {
				x: 25,
				y: 10,
			},
			size: {
				width: 80,
				height: 40,
			},
			attrs: {
				text: {
					text: "Entidade",
				},
				".outer": {
					fill: "#FFFFFF",
					stroke: "black",
				},
			},
		});
	};

	const _createIsa = function () {
		return new erd.ISA({
			position: {
				x: 40,
				y: 70,
			},
			size: {
				width: 50,
				height: 40,
			},
		});
	};

	const _createRelationship = function () {
		return new erd.Relationship({
			position: {
				x: 25,
				y: 130,
			},
			size: {
				width: 85,
				height: 45,
			},
			attrs: {
				text: {
					text: "Rel",
				},
				".outer": {
					fill: "#FFFFFF",
					stroke: "black",
				},
			},
		});
	};

	const _createAssociative = function () {
		return new erd.Associative({
			position: {
				x: 15,
				y: 185,
			},
			size: {
				width: 100,
				height: 50,
			},
			attrs: {
				".outer": {
					fill: "#FFFFFF",
					stroke: "black",
				},
				".inner": {
					fill: "transparent",
					stroke: "black",
				},
			},
		});
	};

	const _createAttribute = function () {
		return new erd.Attribute({
			position: {
				x: 65,
				y: 265,
			},
			attrs: {
				text: {
					text: "Atributo",
				},
			},
		});
	};

	const _createKey = function () {
		return new erd.Key({
			position: {
				x: 65,
				y: 305,
			},
			attrs: {
				text: {
					text: "Chave",
				},
			},
		});
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

	const _createComposedAttribute = function () {
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

	return {
		createEntity: _createEntity,
		createAttribute: _createAttribute,
		createIsa: _createIsa,
		createRelationship: _createRelationship,
		createKey: _createKey,
		createAssociative: _createAssociative,
		createBlockAssociative: _createBlockAssociative,
		createComposedAttribute: _createComposedAttribute,
	};
};

export default angular
	.module("app.shapeFactory", [])
	.factory("ShapeFactory", shapeFactory).name;