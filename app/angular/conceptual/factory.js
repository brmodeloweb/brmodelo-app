export default class Factory {

	constructor(shapes) {
		this.shapes = shapes;
	}

	createEntity = (customConfig) => {
		return new this.shapes.erd.Entity(customConfig);
	};

	createRelationship = (customConfig) => {
		return new this.shapes.erd.Relationship(customConfig);
	};

	createIsa = (customConfig) => {
		return new this.shapes.erd.ISA(customConfig);
	};

	createAssociative = (customConfig) => {
		return new this.shapes.erd.Associative(customConfig)
	};

	createAttribute = (customConfig) => {
		return new this.shapes.erd.Attribute(customConfig);
	};

	createKey = (customConfig) => {
		return new this.shapes.erd.Key(customConfig);
	};

	createLink = (customConfig) => {
		return new this.shapes.erd.Link(customConfig);
	};

}