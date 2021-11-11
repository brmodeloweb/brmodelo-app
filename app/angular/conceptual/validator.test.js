import Validator from "./validator";
import Factory from "./factory";

import * as joint from "jointjs";

import shapes from "../../joint/shapes";
joint.shapes.erd = shapes;

describe("Test shape erd validator", () => {

  const validator = new Validator(); 
  const factory = new Factory(joint.shapes); 

  test("It should validate an Entity", async () => {
    const entity = factory.createEntity();
    expect(validator.isEntity(entity)).toBeTruthy()
  });

  test("It should validate a Relationship", async () => {
    const entity = factory.createRelationship();
    expect(validator.isRelationship(entity)).toBeTruthy()
  });

  test("It should validate an Attribute", async () => {
    const entity = factory.createAttribute();
    expect(validator.isAttribute(entity)).toBeTruthy()
  });

  test("It should validate a Extension", async () => {
    const entity = factory.createIsa();
    expect(validator.isExtension(entity)).toBeTruthy()
  });

  test("It should validate a Associative Entity", async () => {
    const entity = factory.createAssociative();
    expect(validator.isAssociative(entity)).toBeTruthy()
  });

  test("It should validate a Link", async () => {
    const entity = factory.createLink();
    expect(validator.isLink(entity)).toBeTruthy()
  });

});