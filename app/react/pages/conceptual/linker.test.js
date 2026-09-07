import { shapes } from '@joint/core';

import Linker from "./linker";
import Factory from "./factory";
import Validator from "./validator";

describe("Test getConnectionType", () => {

  const factory = new Factory(shapes);
  const validator = new Validator();
  const linker = new Linker(factory, validator);

  test("It should return an Entity-Entity type", () => {
    const source = factory.createEntity();
    const target = factory.createEntity();
    const connectionType = linker.getConnectionType(source, target);
    expect(connectionType).toBe("Entity-Entity");
  });

  test("It should return an Entity-Relationship type", () => {
    const source = factory.createEntity();
    const target = factory.createRelationship();
    const connectionType = linker.getConnectionType(source, target);
    expect(connectionType).toBe("Entity-Relationship");
  });

  test("It should return an Entity-Extension type", () => {
    const source = factory.createEntity();
    const target = factory.createIsa();
    const connectionType = linker.getConnectionType(source, target);
    expect(connectionType).toBe("Entity-Extension");
  });

  test("It should return an Entity-Attribute type", () => {
    const source = factory.createEntity();
    const target = factory.createAttribute();
    const connectionType = linker.getConnectionType(source, target);
    expect(connectionType).toBe("Entity-Attribute");
  });

  test("It should return an Entity-Key type", () => {
    const source = factory.createEntity();
    const target = factory.createKey();
    const connectionType = linker.getConnectionType(source, target);
    expect(connectionType).toBe("Entity-Key");
  });

  test("It should return an Attribute-Attribute type", () => {
    const source = factory.createAttribute();
    const target = factory.createAttribute();
    const connectionType = linker.getConnectionType(source, target);
    expect(connectionType).toBe("Attribute-Attribute");
  });

  test("It should return an Invalid-Connection type", () => {
    const source = factory.createAttribute();
    const target = factory.createKey();
    const connectionType = linker.getConnectionType(source, target);
    expect(connectionType).toBe("Invalid-Connection");
  });

  test("It should return an Relationship-Attribute type", () => {
    const source = factory.createAttribute();
    const target = factory.createRelationship();
    expect(linker.getConnectionType(source, target)).toBe("Relationship-Attribute");
    expect(linker.getConnectionType(target, source)).toBe("Relationship-Attribute");
  });

  test("It should return an Relationship-Key type", () => {
    const source = factory.createRelationship();
    const target = factory.createKey();
    expect(linker.getConnectionType(source, target)).toBe("Relationship-Key");
    expect(linker.getConnectionType(target, source)).toBe("Relationship-Key");
  });

});

describe("Test isValidConnection", () => {
  const factory = new Factory(shapes);
  const validator = new Validator();
  const linker = new Linker(factory, validator);

  test("It should be a invalid connection when source is null", () => {
    const source = factory.createAttribute();
    expect(linker.isValidConnection(source, null)).toBeFalsy();
  });

  test("It should be a invalid connection when target is null", () => {
    const target = factory.createKey();
    expect(linker.isValidConnection(null, target)).toBeFalsy();
  });

  test("It should not allow invalid connections", () => {
    const source = factory.createAttribute();
    const target = factory.createKey();
    expect(linker.isValidConnection(source, target)).toBeFalsy();
  });

  test("It should allow valid connections", () => {
    expect(linker.isValidConnection(factory.createEntity(), factory.createKey())).toBeTruthy();
    expect(linker.isValidConnection(factory.createEntity(), factory.createRelationship())).toBeTruthy();
    expect(linker.isValidConnection(factory.createEntity(), factory.createEntity())).toBeTruthy();
    expect(linker.isValidConnection(factory.createAttribute(), factory.createAttribute())).toBeTruthy();
  });

  test("It should allow Entity-Extension", () => {
    const entity = factory.createEntity();
    const isa1 = factory.createIsa();

    const mockedGraph = {
      getNeighbors: () => {
        return [isa1];
      }
    }

    entity.graph = mockedGraph;

    expect(linker.isValidConnection(entity, isa1)).toBeTruthy();
    expect(linker.isValidConnection(isa1, entity )).toBeTruthy();
  });


  test("It should allow Entity-Attribute connection when it is connected only to an Entity", () => {
    const entity = factory.createEntity();
    const attribute = factory.createAttribute();

    const mockedGraph = {
      getNeighbors: () => {
        return [entity];
      }
    }

    attribute.graph = mockedGraph;

    expect(linker.isValidConnection(factory.createEntity(), attribute)).toBeTruthy();
  });

  test("It should allow Entity-Attribute connection when it is connected only to an Entity and another attributes", () => {
    const entity = factory.createEntity();
    const attribute = factory.createAttribute();

    const mockedGraph = {
      getNeighbors: () => {
        return [entity, factory.createAttribute(), factory.createAttribute()];
      }
    }

    attribute.graph = mockedGraph;

    const isValid = linker.isValidConnection(entity, attribute)
    expect(isValid).toBeTruthy();
  });

});

describe("connectAttributeAttribute — topology-based parent detection (#268)", () => {
  const factory = new Factory(shapes);
  const validator = new Validator();
  const linker = new Linker(factory, validator);

  test("source attached to entity becomes parent (normal drag direction)", () => {
    const entity = factory.createEntity();
    const parent = factory.createAttribute();
    const child = factory.createAttribute();
    const mockedGraph = {
      getNeighbors: (cell) =>
        cell === parent ? [entity] :
        cell === child ? [] : []
    };
    linker.connectAttributeAttribute(parent, child, mockedGraph);
    expect(parent.attributes.composed).toBe(true);
    expect(child.attributes.composed).toBe(false);
  });

  test("target attached to entity becomes parent (link drawn reversed)", () => {
    const entity = factory.createEntity();
    const parent = factory.createAttribute();
    const child = factory.createAttribute();
    const mockedGraph = {
      getNeighbors: (cell) =>
        cell === parent ? [entity] :
        cell === child ? [] : []
    };
    // User dragged from child to parent — child is source, parent is target.
    linker.connectAttributeAttribute(child, parent, mockedGraph);
    expect(parent.attributes.composed).toBe(true);
    expect(child.attributes.composed).toBe(false);
  });

  test("falls back to source=parent when neither has entity neighbor", () => {
    const a = factory.createAttribute();
    const b = factory.createAttribute();
    const mockedGraph = { getNeighbors: () => [] };
    linker.connectAttributeAttribute(a, b, mockedGraph);
    expect(a.attributes.composed).toBe(true);
    expect(b.attributes.composed).toBe(false);
  });

  test("falls back to source=parent when both have entity neighbors", () => {
    const entity = factory.createEntity();
    const a = factory.createAttribute();
    const b = factory.createAttribute();
    const mockedGraph = { getNeighbors: () => [entity] };
    linker.connectAttributeAttribute(a, b, mockedGraph);
    expect(a.attributes.composed).toBe(true);
    expect(b.attributes.composed).toBe(false);
  });

});