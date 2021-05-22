
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

  connectEntityExtension = (source, target, link) => {

  }

  connectEntityAttribute = (source, target, link) => {

  }

  connectAttributeAttribute = (source, target) => {
    source.attributes.composed = true;
    target.attributes.composed = true;
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

    if(connectionType === "Invalid-Connection") {
      return false;
    }

    if (connectionType === "Entity-Attribute") {
      let attribute;
      let parent;

      if(this.validator.isAttribute(source)) {
        attribute = source;
        parent = target;
      } else {
        attribute = target;
        parent = source;
      }

      const neighbors = attribute.graph.getNeighbors(attribute);
      if(neighbors.length == 1) {
        return true;
      }

      return neighbors.every(connection => {
        return this.validator.isAttribute(connection) || connection.id == parent.id;
      });
    }

    return true;
  }

}