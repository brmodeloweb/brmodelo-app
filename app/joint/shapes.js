import { dia, linkTools } from '@joint/core';

const setText = (element, view, newText) => {
	element.attributes.attrs.text.text = newText;
	view.update();
	const textSize = view.$el.find("text")[0].getBBox().width;
	if((textSize > 80)) {
		const currentSize = element.get('size');
		element.resize(textSize + 10, currentSize.height);
	}
}

const erd = {};

erd.Entity = dia.Element.define('erd.Entity', {
  supertype: "Entity",
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
      "ref-x": .5,
      "ref-y": .5,
      "x-alignment": "middle",
      "y-alignment": "middle",
    },
  }}, {
    markup: '<g class="rotatable"><g class="scalable"><polygon class="outer"/><polygon class="inner"/></g><text/></g>',
    useCSSSelectors: true,
    setText: function (newText, view) {
      setText(this, view, newText);
    },
    setColor: function (newColor) {
      this.attr('.outer/fill', newColor);
    }
});


erd.Relationship = dia.Element.define('erd.Relationship', {
	supertype: "Relationship",
	autorelationship: false,
	blockAssociative: false,
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
	}
}, {
	markup: '<g class="rotatable"><g class="scalable"><polygon class="outer"/><polygon class="inner"/></g><text/></g>',
	useCSSSelectors: true,
	setText: function (newText, view) {
		setText(this, view, newText);
	},
	setBlockAssociative: function () {
		this.attributes.blockAssociative = true;
	},
	setColor: function (newColor) {
		this.attr('.outer/fill', newColor);
	}
});

erd.ISA = dia.Element.define('erd.ISA', {
	supertype: "Inheritance",
	parentId: null,
  level: 0,
	size: { width: 50, height: 40 },
	attrs: {
		root: {
			magnetSelector: ".poly"
		},
		polygon: {
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
	}
}, {
	markup: '<g class="rotatable"><g class="scalable"><polygon class="poly"/></g><text/></g>',
	useCSSSelectors: true,
	setText: function (newText, view) {
		this.attributes.attrs.text.text = newText;
		view.update();
	},
	setColor: function (newColor) {
		this.attr('polygon/fill', newColor);
	}
});

erd.Associative = dia.Element.define('erd.Associative', {
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
      'font-family': 'Arial',
      'font-size': 12,
      ref: ".outer",
      'ref-x': .5,
      'ref-y': .5,
      'x-alignment': 'middle',
      'y-alignment': 'middle'
    }
  }}, {
    markup: '<g class="rotatable"><g class="scalable"><polygon class="outer"/><polygon class="inner"/></g><text/></g>',
    useCSSSelectors: true,
    setText: function (newText, view) {
      this.attributes.attrs.text.text = newText;
      view.update();
    },
    setColor: function (newColor) {
      this.attr('.outer/fill', newColor);
    }
});

erd.BlockAssociative = dia.Element.define('erd.BlockAssociative', {
  supertype: 'Entity',
  size: { width: 120, height: 60 },
  attrs: {
    '.outer': {
      fill: 'white',
      stroke: 'black',
      points: '100,0 100,60 0,60 0,0'
    }
  }}, {
    markup: '<g class="rotatable"><g class="scalable"><polygon class="outer"/></g><text/></g>',
    useCSSSelectors: true,
    setColor: function (newColor) {
      this.attr('.outer/fill', newColor);
    }
});

erd.Attribute = dia.Element.define('erd.Attribute', {
  supertype: "Attribute",
  cardinality: "(1, 1)",
  multivalued: false,
  composed: false,
  size: {
    width: 15,
    height: 15,
  },
  attrs: {
    root: {
      magnetSelector: ".outer"
    },
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
  }}, {
    markup: '<g class="rotatable"><g class="scalable"><ellipse class="outer"/><ellipse class="inner"/></g><text/></g>',
    useCSSSelectors: true,
    setText: function (newText, view) {
      this.attributes.attrs.text.text = newText;
      if(view != null) {
        view.update();
      }
    },
    setColor: function (newColor) {
      this.attr('.outer/fill', newColor);
    }
});

erd.Key = dia.Element.define('erd.Key', {
  supertype: "Key",
  cardinality: "(1, 1)",
  multivalued: false,
  composed: false,
  size: {
    width: 15,
    height: 15,
  },
  attrs: {
    root: {
      magnetSelector: ".outer"
    },
    ellipse: {
      stroke: "black",
      "stroke-width": 2,
      transform: "translate(0, 15)",
      opacity: 0.6
    },
    ".outer": {
      cy: 0,
      rx: 30,
      ry: 15,
      fill: "black"
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
  }}, {
    markup: '<g class="rotatablex"><g class="scalable"><ellipse class="outer"/><ellipse class="inner"/></g><text/></g>',
    useCSSSelectors: true,
    setText: function (newText, view) {
      this.attributes.attrs.text.text = newText;
      view.update();
    }
});

erd.Link = dia.Link.define('erd.Link', {
  supertype: "Link",
  weak: false,
  role: "",
  attrs: {
    line: {
      connection: true,
      stroke: '#333333',
      'stroke-width': 1,
      'stroke-linejoin': 'round',
      'pointer-events': 'none'
    },
    wrapper: {
      connection: true,
      stroke: 'transparent',
      'stroke-width': 10,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }
  }}, {
    markup: [{
      tagName: 'path',
      selector: 'wrapper',
      attributes: {
        'fill': 'none',
        'cursor': 'pointer',
        'stroke': 'transparent',
        'stroke-linejoin': 'round'
      }
    }, {
      tagName: 'path',
      selector: 'line',
      attributes: {
        'fill': 'none',
        'pointer-events': 'none'
      }
    }],
    setWeak: function (weak, view) {
      if(weak) {
        this.attributes.attrs.line.stroke = 'black';
        this.attributes.attrs.line['stroke-width'] = 3;
      } else {
        this.attributes.attrs.line.stroke = 'black';
        this.attributes.attrs.line['stroke-width'] = 1;
      }
      if(view != null) {
        view.update();
      }
      this.attributes.weak = weak;
    }
});

erd.Line = erd.Link

erd.InfoButton = linkTools.Button.extend({
	name: 'info-button',
	options: {
			markup: [{
					tagName: 'circle',
					selector: 'button',
					attributes: {
							'r': 7,
							'fill': '#001DFF',
							'cursor': 'pointer'
					}
			}, {
					tagName: 'path',
					selector: 'icon',
					attributes: {
							'd': 'M -2 4 2 4 M 0 3 0 0 M -2 -1 1 -1 M -1 -4 1 -4',
							'fill': 'none',
							'stroke': '#FFFFFF',
							'stroke-width': 2,
							'pointer-events': 'none'
					}
			}],
			distance: 40,
			offset: 0,
			action: function(evt) {
				this.notify('link:options', evt, this.sourceView, this.sourceMagnet, 'source');
			}
	}
});

export default erd;

