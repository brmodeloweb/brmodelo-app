export default class Factory {

	constructor(shapes) {
		this.shapes = shapes;
	}

	createEntity = (customConfig) => {
		return new this.shapes.Entity(customConfig);
	};

	createRelationship = (customConfig) => {
		return new this.shapes.Relationship(customConfig);
	};

	createIsa = (customConfig) => {
		return new this.shapes.ISA(customConfig);
	};

	createAssociative = (customConfig) => {
		return new this.shapes.Associative(customConfig)
	};

	createAttribute = (customConfig) => {
		return new this.shapes.Attribute(customConfig);
	};

	createKey = (customConfig) => {
		return new this.shapes.Key(customConfig);
	};

	createLink = (customConfig) => {
		return new this.shapes.Link(customConfig);
	};

	createBlockAssociative = (customConfig) => {
		return new this.shapes.BlockAssociative(customConfig);
	};

}