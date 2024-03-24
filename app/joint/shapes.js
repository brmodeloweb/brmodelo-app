import { dia, shapes, linkTools } from "@joint/core/dist/joint"
import "../joint/legacyLinkView"
import composedImg from "../img/composto-01.png"

const Entity = dia.Element.define('erd.Entity', {
	size: { width: 80, height: 40 },
	type: "erd.Entity",
	supertype: "Entity",
	isExtended: false,
	autorelationship: false,
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
}, {
	markup:
		'<g class="rotatable"><g class="scalable"><polygon class="outer"/><polygon class="inner"/></g><text/></g>',
	useCSSSelectors: true
});

const Relationship = dia.Element.define('erd.Relationship', {
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
	{
		markup: '<g class="rotatable"><g class="scalable"><polygon class="outer"/><polygon class="inner"/></g><text/></g>',
		useCSSSelectors: true
	}
);

const ISA = dia.Element.define('erd.ISA', {
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
}, {
	markup:
		'<g class="rotatable"><g class="scalable"><polygon class="poly"/></g><text/></g>',
	useCSSSelectors: true
});

const Associative = dia.Element.define('erd.Associative', {
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
}, {
	markup: '<g class="rotatable"><g class="scalable"><polygon class="outer"/><polygon class="inner"/></g><text/></g>',
	useCSSSelectors: true
});

const BlockAssociative = dia.Element.define('erd.BlockAssociative', {
	type: 'erd.BlockAssociative',
	supertype: 'Entity',
	size: { width: 100, height: 50 },
	attrs: {
		'.outer': {
			fill: 'white', stroke: 'black',
			points: '100,0 100,60 0,60 0,0'
		}
	}
}, {
	markup: '<g class="rotatable"><g class="scalable"><polygon class="outer"/></g><text/></g>',
	useCSSSelectors: true
});

const Attribute = dia.Element.define('erd.Attribute', {
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
}, {
	markup: '<g class="rotatablex"><g class="scalable"><ellipse class="outer"/><ellipse class="inner"/></g><text/></g>',
	useCSSSelectors: true
});

const Key = dia.Element.define('erd.Key', {
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
}, {
	markup: '<g class="rotatablex"><g class="scalable"><ellipse class="outer"/><ellipse class="inner"/></g><text/></g>',
	useCSSSelectors: true
});

const ComposedAttribute = dia.Element.define('erd.ComposedAttribute', {
			type: 'erd.ComposedAttribute',
			size: { width: 60, height: 40 },
			attrs: {
					'rect': { fill: 'transparent', stroke: 'transparent', width: 50, height: 30 },
					'image': { "xlink:href": composedImg },
			}
}, {
	markup: '<g class="rotatable"><g class="scalable"><rect/></g><image/><text/></g>',
	useCSSSelectors: true
});

const Link = dia.Link.define('link', {
	type: "link",
	supertype: "Link",
	weak: false,
	role: "",
	attrs: {
			line: {
					connection: true,
					stroke: '#333333',
					strokeWidth: 1,
					strokeLinejoin: 'round'
			},
			wrapper: {
					connection: true,
					strokeWidth: 10,
					strokeLinejoin: 'round'
			}
	}
}, {
	useCSSSelectors: true,
	markup: [{
			tagName: 'path',
			selector: 'wrapper',
			attributes: {
					'fill': 'none',
					'cursor': 'pointer',
					'stroke': 'transparent'
			}
	}, {
			tagName: 'path',
			selector: 'line',
			attributes: {
					'fill': 'none',
					'pointer-events': 'none'
			}
	}]
});


const Line = dia.Link.define('erd.Line', {
	type: "erd.Line",
	supertype: "Link",
	weak: false,
	role: "",
	attrs: {
			line: {
					connection: true,
					stroke: '#333333',
					strokeWidth: 1,
					strokeLinejoin: 'round'
			},
			wrapper: {
					connection: true,
					strokeWidth: 10,
					strokeLinejoin: 'round'
			}
	}
}, {
	useCSSSelectors: true,
	markup: [{
			tagName: 'path',
			selector: 'wrapper',
			attributes: {
					'fill': 'none',
					'cursor': 'pointer',
					'stroke': 'transparent'
			}
	}, {
			tagName: 'path',
			selector: 'line',
			attributes: {
					'fill': 'none',
					'pointer-events': 'none'
			}
	}]
});

// erd.InfoButton = joint.linkTools.InfoButton = joint.linkTools.Button.extend({
// 	name: 'info-button',
// 	options: {
// 			markup: [{
// 					tagName: 'circle',
// 					selector: 'button',
// 					attributes: {
// 							'r': 7,
// 							'fill': '#001DFF',
// 							'cursor': 'pointer'
// 					}
// 			}, {
// 					tagName: 'path',
// 					selector: 'icon',
// 					attributes: {
// 							'd': 'M -2 4 2 4 M 0 3 0 0 M -2 -1 1 -1 M -1 -4 1 -4',
// 							'fill': 'none',
// 							'stroke': '#FFFFFF',
// 							'stroke-width': 2,
// 							'pointer-events': 'none'
// 					}
// 			}],
// 			distance: 40,
// 			offset: 0,
// 			action: function(evt) {
// 				this.notify('link:options', evt, this.sourceView, this.sourceMagnet, 'source');
// 			}
// 	}
// });

export default {
		Entity,
		Relationship,
		ISA,
		Associative,
		BlockAssociative,
		Attribute,
		Key,
		ComposedAttribute,
		Link,
		Line
	};

