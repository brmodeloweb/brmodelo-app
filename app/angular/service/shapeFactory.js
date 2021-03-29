import angular from "angular";

const shapeFactory = function () {

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

	return {
		//createComposedAttribute: _createComposedAttribute,
	};
};

export default angular
	.module("app.shapeFactory", [])
	.factory("ShapeFactory", shapeFactory).name;
