import * as joint from "jointjs";
import _ from "lodash";

const erd = joint.shapes.erd;

erd.Entity = joint.dia.Element.extend({
  markup:
    '<g class="rotatable"><g class="scalable"><polygon class="outer"/><polygon class="inner"/></g><text/></g>',
  defaults: _.defaultsDeep(
    {
      type: "erd.Entity",
      supertype: "Entity",
      isExtended: false,
      autorelationship: false,
      size: { width: 80, height: 40 },
      attrs: {
        ".outer": {
          fill: "#FFFFFF",
          stroke: "black",
          "stroke-width": 1,
          points: "100,0 100,60 0,60 0,0",
        },
        ".inner": {
          fill: "#2ECC71",
          stroke: "#27AE60",
          "stroke-width": 1,
          points: "95,5 95,55 5,55 5,5",
          display: "none",
        },
        text: {
          text: "Entity",
          "font-family": "Arial",
          "font-size": 14,
          ref: ".outer",
          "ref-x": 0.5,
          "ref-y": 0.5,
          "x-alignment": "middle",
          "y-alignment": "middle",
        },
      },
    },
    joint.dia.Element.prototype.defaults
  ),
});

erd.Relationship = joint.dia.Element.extend({
  markup:
    '<g class="rotatable"><g class="scalable"><polygon class="outer"/><polygon class="inner"/></g><text/></g>',
  defaults: _.defaultsDeep(
    {
      type: "erd.Relationship",
      supertype: "Relationship",
      autorelationship: false,
      size: { width: 85, height: 45 },
      attrs: {
        ".outer": {
          fill: "#FFFFFF",
          stroke: "black",
          "stroke-width": 1,
          points: "40,0 80,40 40,80 0,40",
        },
        ".inner": {
          fill: "#3498DB",
          stroke: "#2980B9",
          "stroke-width": 1,
          points: "40,5 75,40 40,75 5,40",
          display: "none",
        },
        text: {
          text: "Rel",
          "font-family": "Arial",
          "font-size": 12,
          ref: ".outer",
          "ref-x": 0.5,
          "ref-y": 0.5,
          "x-alignment": "middle",
          "y-alignment": "middle",
        },
      },
    },
    joint.dia.Element.prototype.defaults
  ),
});

erd.ISA = joint.dia.Element.extend({
  markup:
    '<g class="rotatable"><g class="scalable"><polygon class="poly"/></g><text/></g>',
  defaults: _.defaultsDeep(
    {
      type: "erd.ISA",
      supertype: "Inheritance",
      parentId: null,
      size: { width: 50, height: 40 },
      attrs: {
        polygon: {
          //25,0 15,50 35,50
          points: "25,0 0,50 50,50",
          fill: "#FFFFFF",
          stroke: "black",
          "stroke-width": 1,
        },
        text: {
          text: "(t,c)",
          ref: ".poly",
          "ref-x": 0.9,
          "ref-y": 0.3,
        },
      },
    },
    joint.dia.Element.prototype.defaults
  ),
});

erd.Associative = joint.dia.Element.extend({
  markup: '<g class="rotatable"><g class="scalable"><polygon class="outer"/><polygon class="inner"/></g><text/></g>',
  defaults: _.defaultsDeep({
    type: 'erd.Associative',
    supertype: 'Relationship',
    isExtended: false,
    autorelationship: false,
    weak: false,
    size: { width: 100, height: 50 },
    attrs: {
      '.outer': {
        fill: '#FFFFFF',
        stroke: 'black',
        'stroke-width': 1,
        points: '50,5 95,30 50,55 5,30',
      },
      '.inner': {
        fill: 'transparent',
        stroke: 'black',
        'stroke-width': 1,
        points: '100,0 100,60 0,60 0,0'
      },
      text: {
        text: 'Auto',
        'font-family': 'Arial', 'font-size': 12,
        ref: '.outer', 'ref-x': .5, 'ref-y': .5,
        'x-alignment': 'middle', 'y-alignment': 'middle'
      }
    }
  }, joint.dia.Element.prototype.defaults)
});

erd.Attribute = joint.dia.Element.extend({
  markup:
    '<g class="rotatablex"><g class="scalable"><ellipse class="outer"/><ellipse class="inner"/></g><text/></g>',
  defaults: _.defaultsDeep(
    {
      type: "erd.Attribute",
      supertype: "Attribute",
      cardinality: "(1, 1)",
      multivalued: false,
      composed: false,
      size: {
        width: 15,
        height: 15,
      },
      attrs: {
        ellipse: {
          stroke: "black",
          "stroke-width": 1,
          transform: "translate(0, 15)",
          opacity: 0.6,
        },
        ".outer": {
          cy: 0,
          rx: 30,
          ry: 15,
          fill: "white",
        },
        ".inner": {
          cx: 10,
          cy: 25,
          rx: 45,
          ry: 20,
          fill: "black",
          display: "none",
        },
        text: {
          text: "Atributo",
          ref: ".outer",
          "ref-x": 0.5,
          "ref-y": -8,
          "x-alignment": "middle",
          "y-alignment": "middle",
        },
      },
    },
    joint.dia.Element.prototype.defaults
  ),
});

erd.Key = joint.dia.Element.extend({
  markup:
    '<g class="rotatablex"><g class="scalable"><ellipse class="outer"/><ellipse class="inner"/></g><text/></g>',
  defaults: _.defaultsDeep(
    {
      type: "erd.Key",
      supertype: "Key",
      cardinality: "(1, 1)",
      multivalued: false,
      composed: false,
      size: {
        width: 15,
        height: 15,
      },
      attrs: {
        ellipse: {
          stroke: "black",
          "stroke-width": 2,
          transform: "translate(0, 15)",
          opacity: 0.6,
        },
        ".outer": {
          cy: 0,
          rx: 30,
          ry: 15,
          fill: "black",
        },
        ".inner": {
          cx: 10,
          cy: 25,
          rx: 45,
          ry: 20,
          fill: "black",
          display: "none",
        },
        text: {
          text: "Chave",
          ref: ".outer",
          "ref-x": 0.5,
          "ref-y": -8,
          "x-alignment": "middle",
          "y-alignment": "middle",
        },
      },
    },
    joint.dia.Element.prototype.defaults
  ),
});

erd.Link = joint.dia.Link.extend({
  defaults: { type: "erd.Link" },
  weak: false,
  role: "",
  attrs: {
    ".marker-target": {
      d: "M 10 0 L 0 5 L 10 10 z",
      fill: "#34495e",
      stroke: "#2c3e50",
    },
    ".connection": { stroke: "#2c3e50" },
  },
});

export default erd;

  // const createComposedAttribute = function () {
//   return new erd.ComposedAttribute({
//     size: {
//       width: 60,
//       height: 60,
//     },
//     position: {
//       x: 20,
//       y: 320,
//     },
//     attrs: {
//       image: { "xlink:href": "../../assets/img/composto-01.png" },
//     },
//   });
// };