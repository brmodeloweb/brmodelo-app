import Factory from "./factory";

import * as joint from "jointjs";

import shapes from "../../joint/shapes";
joint.shapes.erd = shapes;

describe('factory', () => {

  const factory = new Factory(joint.shapes); 
  const position = { x: 0, y: 1 };

  test("It should create an Entity", async () => {
    const entity = factory.createEntity( { "position": position });

    expect(entity.attributes.type).toBe("erd.Entity");
    expect(entity.attributes.supertype).toBe("Entity");
    expect(entity.attributes.isExtended).toBeFalsy();
    expect(entity.attributes.autorelationship).toBeFalsy();
    expect(entity.attributes.position).toMatchObject(position);
  });

  test("It should create a Relationship", async () => {
    const entity = factory.createRelationship({ "position": position });

    expect(entity.attributes.type).toBe("erd.Relationship");
    expect(entity.attributes.supertype).toBe("Relationship");
    expect(entity.attributes.autorelationship).toBeFalsy();
    expect(entity.attributes.position).toMatchObject(position);
  });

  test("It should create an Extension", async () => {
    const entity = factory.createIsa({ "position": position });
    
    expect(entity.attributes.type).toBe("erd.ISA");
    expect(entity.attributes.supertype).toBe("Inheritance");
    expect(entity.attributes.parentId).toBeNull();
    expect(entity.attributes.position).toMatchObject(position);
  });

  test("It should create an Attribute", async () => {
    const entity = factory.createAttribute({ "position": position });
    
    expect(entity.attributes.type).toBe("erd.Attribute");
    expect(entity.attributes.supertype).toBe("Attribute");
    expect(entity.attributes.multivalued).toBeFalsy();
    expect(entity.attributes.composed).toBeFalsy();
  });

  test("It should create a Key", async () => {
    const entity = factory.createKey({ "position": position });
    
    expect(entity.attributes.type).toBe("erd.Key");
    expect(entity.attributes.supertype).toBe("Key");
    expect(entity.attributes.multivalued).toBeFalsy();
    expect(entity.attributes.composed).toBeFalsy();
  });

  test("It should create a Link", async () => {
    const entity = factory.createLink();

    expect(entity.attributes.type).toBe("erd.Link");
    expect(entity.attributes.weak).toBeFalsy();
  });

});
