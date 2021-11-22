export default class Linker {

  constructor(shapeFactory, shapeValidator) {
    this.factory = shapeFactory;
    this.validator = shapeValidator;
  }

  createLink = (source, target, graph) => {
    const newLink = this.factory.createLink({
      source: {
        id: source.id
      },
      target: {
        id: target.id
      }
    });
    newLink.addTo(graph);
    this.onLink(newLink);
    return newLink;
  };

  connectEntities = (source, target, link) => {
    const x1 = source.attributes.position.x;
    const y1 = source.attributes.position.y;
    const x2 = target.attributes.position.x;
    const y2 = target.attributes.position.y;

    var isa = this.factory.createRelationship();

    isa.attributes.position.x = (x1 + x2) / 2;
    isa.attributes.position.y = (y1 + y2) / 2;

    link.graph.addCell(isa);

    this.createLink(source, isa, link.graph);
    this.createLink(target, isa, link.graph);

    link.remove();
  }

  connectEntityRelationship = (target, link) => {
    let pos = 0.3;
    if (this.validator.isEntity(target)) {
      pos = 0.7;
    }
    link.label(0, { position: pos, attrs: { text: { text: '(0, n)' } } });
    link.attributes.type = "erd.Link";
  }

  addAutoRelationship = (entityView) => {
    const entity = entityView.element.model;
    const rel = this.factory.createRelationship();

    rel.attributes.position.x = entity.attributes.position.x + 150;
    rel.attributes.position.y = entity.attributes.position.y;

    const graph = entity.graph;

    graph.addCell(rel);

    var link1 = this.createLink(entity, rel, graph);
    link1.set('vertices', [{ x: entity.attributes.position.x + 120, y: entity.attributes.position.y - 10 }]);
    link1.label(0, { position: 0.3, attrs: { text: { text: '(0, n)' } } });
    link1.attributes.type = "erd.Link";

    var link2 = this.createLink(entity, rel, graph);
    link2.set('vertices', [{ x: entity.attributes.position.x + 120, y: entity.attributes.position.y + 60 }]);
    link2.label(0, { position: 0.3, attrs: { text: { text: '(0, n)' } } });
    link2.attributes.type = "erd.Link";

    rel.attributes.autorelationship = true;
  }

  connectEntityExtension = (source, target, link) => {

  }

  connectEntityAttribute = (source, target, link) => {

  }

  connectAttributeAttribute = (source, target) => {
    source.attributes.composed = true;
    target.attributes.composed = false;
  }

	getConnectionTypeFromLink = (link) => {
		const source = link.graph.getCell(link.get('source').id);
		const target = link.graph.getCell(link.get('target').id);
		return this.getConnectionType(source, target);
	}

  getConnectionType = (source, target) => {
    if (this.validator.isEntity(source) && this.validator.isEntity(target)) {
      return "Entity-Entity";
    }

    if ((this.validator.isEntity(source) || this.validator.isEntity(target)) && (this.validator.isRelationship(source) || this.validator.isRelationship(target))) {
      return "Entity-Relationship";
    }

    if ((this.validator.isEntity(source) || this.validator.isEntity(target)) && (this.validator.isExtension(source) || this.validator.isExtension(target))) {
      return "Entity-Extension";
    }

    if ((this.validator.isEntity(source) || this.validator.isEntity(target)) && (this.validator.isAttribute(source) || this.validator.isAttribute(target))) {
      return "Entity-Attribute";
    }

    if ((this.validator.isEntity(source) || this.validator.isEntity(target)) && (this.validator.isKey(source) || this.validator.isKey(target))) {
      return "Entity-Key";
    }

    if ((this.validator.isRelationship(source) || this.validator.isRelationship(target)) && (this.validator.isAttribute(source) || this.validator.isAttribute(target))) {
      return "Relationship-Attribute";
    }

    if ((this.validator.isRelationship(source) || this.validator.isRelationship(target)) && (this.validator.isKey(source) || this.validator.isKey(target))) {
      return "Relationship-Key";
    }

    if (this.validator.isAttribute(source) && this.validator.isAttribute(target)) {
      return "Attribute-Attribute";
    }

    return "Invalid-Connection";
  }

  onLink = (link) => {
    const source = link.graph.getCell(link.get('source').id);
    const target = link.graph.getCell(link.get('target').id);

    if (!this.isValidConnection(source, target, link)) {
      link.remove();
      return;
    }

    switch (this.getConnectionType(source, target)) {
      case "Entity-Entity":
        this.connectEntities(source, target, link);
        break;
      case "Entity-Relationship":
        this.connectEntityRelationship(target, link);
        break;
      case "Entity-Extension":
        console.log(`conecting Entity-Extension`);
        break;
      case "Entity-Attribute":
        console.log(`conecting Entity-Attribute`);
        break;
      case "Attribute-Attribute":
        this.connectAttributeAttribute(source, target);
        break;
    }
  }

  isValidConnection = (source, target) => {
    if (source == null || target == null) {
      return false;
    }

    const connectionType = this.getConnectionType(source, target);

    if (connectionType === "Invalid-Connection") {
      return false;
    }

    if (connectionType === "Entity-Attribute") {
      let attribute;
      let parent;

      if (this.validator.isAttribute(source)) {
        attribute = source;
        parent = target;
      } else {
        attribute = target;
        parent = source;
      }

      const neighbors = attribute.graph.getNeighbors(attribute);
      if (neighbors.length == 1) {
        return true;
      }

      return neighbors.every(connection => {
        return this.validator.isAttribute(connection) || connection.id == parent.id;
      });
    }

    if (connectionType === "Entity-Extension") {
      let entity = this.validator.isEntity(source) ? source : target;
      const neighbors = entity.graph.getNeighbors(entity);
      const extentions = neighbors.filter(neighbor => this.validator.isExtension(neighbor));
      if (extentions.length > 1) {
        return false;
      }
    }

    return true;
  }

}