import * as joint from "jointjs/dist/joint";
import _ from "lodash";
import composedImg from "../img/composto-01.png"

const setText = (element, view, newText) => {
	element.attributes.attrs.text.text = newText;
	view.update();
	const textSize = view.$el.find("text")[0].getBBox().width;
	if((textSize > 80)) {
		element.attributes.size.width = (textSize + 10);
		view.resize();
	}
}

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
	), setText: function (newText, view) {
			setText(this, view, newText);
	}
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
    joint.dia.Element.prototype.defaults,
  ),
	setText: function (newText, view) {
		setText(this, view, newText);
	}
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
	setText: function (newText, view) {
		this.attributes.attrs.text.text = newText;
		view.update();
	}
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
  }, joint.dia.Element.prototype.defaults),
	setText: function (newText, view) {
		this.attributes.attrs.text.text = newText;
		view.update();
	}
});

erd.BlockAssociative = joint.dia.Element.extend({
  markup: '<g class="rotatable"><g class="scalable"><polygon class="outer"/></g><text/></g>',
  defaults: _.defaultsDeep({
      type: 'erd.BlockAssociative',
      supertype: 'Entity',
      size: { width: 100, height: 50 },
      attrs: {
          '.outer': {
              fill: 'white', stroke: 'black',
              points: '100,0 100,60 0,60 0,0'
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
  ), setText: function (newText, view) {
		this.attributes.attrs.text.text = newText;
		if(view != null) {
			view.update();
		}
	}
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
  ), setText: function (newText, view) {
		this.attributes.attrs.text.text = newText;
		view.update();
	}
});

erd.Link = joint.dia.Link.extend({
  defaults: {
    type: "erd.Link",
    supertype: "Link",
    weak: false,
    role: "",
  }
});

erd.ComposedAttribute = joint.shapes.basic.Generic.extend({
	markup: '<g class="rotatable"><g class="scalable"><rect/></g><image/><text/></g>',
	defaults: joint.util.deepSupplement({
			type: 'erd.ComposedAttribute',
			size: { width: 60, height: 40 },
			attrs: {
					'rect': { fill: 'transparent', stroke: 'transparent', width: 50, height: 30 },
					'image': { "xlink:href": composedImg },
			}
	}, joint.shapes.basic.Generic.prototype.defaults)
});

erd.InfoButton = joint.linkTools.InfoButton = joint.linkTools.Button.extend({
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

function measureText(svgDocument, text, attrs) {
	const vText = V('text').attr(attrs).text(text);
	vText.appendTo(svgDocument);
	const bbox = vText.getBBox();
	vText.remove();
	return bbox;
}

class Note extends joint.dia.Element {
	defaults() {
		 console.log(new joint.dia.Element().markup);
			return {
					...super.defaults,
					type: 'Note',
					supertype: 'Note',
					fillColor: 'red',
					outlineColor: 'blue',
					label: '',
					image: '',
					markup: '<g class="rotatable"><g class="scalable"><polygon class="outer"/><polygon class="inner"/></g><text/></g>'
			};
	}

	preinitialize() {
			this.spacing = 10;
			this.labelAttributes = {
					'font-size': 14,
					'font-family': 'sans-serif',
			};
			this.imageAttributes = {
					'width': 50,
					'height': 50,
					'preserveAspectRatio': 'none'
			};
			this.cache = {};
	}

	initialize() {
			super.initialize();
			this.on('change', this.onAttributeChange);
			//this.setSizeFromContent();
	}

	/* Attributes that affects the size of the model. */
	onAttributeChange() {
			const {
					changed,
					cache
			} = this;
			if ('label' in changed) {
					// invalidate the cache only if the text of the `label` has changed
					delete cache.label;
			}
			if ('label' in changed || 'image' in changed) {
					this.setSizeFromContent();
			}
	}

	setSizeFromContent() {
			delete this.cache.layout;
			const {
					width,
					height
			} = this.layout();
			this.resize(width, height);
	}

	layout() {
			const {
					cache
			} = this;
			let {
					layout
			} = cache;
			if (layout) {
					return layout;
			} else {
					const layout = this.calcLayout();
					cache.layout = layout;
					return layout;
			}
	}

	calcLayout() {
			const {
					attributes,
					labelAttributes,
					imageAttributes,
					spacing,
					cache
			} = this;
			let width = spacing * 2;
			let height = spacing * 2;
			let x = spacing;
			let y = spacing;
			// image metrics
			let $image;
			if (attributes.image) {
					const {
							width: w,
							height: h
					} = imageAttributes;
					$image = {
							x,
							y,
							width: w,
							height: h
					};
					height += spacing + h;
					y += spacing + h;
					width += w;
			} else {
					$image = null;
			}

			console.log(this);
			// label metrics
			let $label; {
					let w, h;
					if ('label' in cache) {
							w = cache.label.width;
							h = cache.label.height;
					} else {
							const {
									width,
									height
							} = measureText(svg, attributes.label, labelAttributes);
							w = width;
							h = height;
							cache.label = {
									width,
									height
							};
					}
					width = Math.max(width, spacing + w + spacing);
					height += h;
					if (!h) {
							// no text
							height -= spacing;
					}
					$label = {
							x,
							y,
							width: w,
							height: h
					};
			}
			// root metrics
			return {
					x: 0,
					y: 0,
					width,
					height,
					$image,
					$label
			};
	}
}

const ElementView = joint.dia.ElementView;
const NoteView = ElementView.extend({

	presentationAttributes: ElementView.addPresentationAttributes({
			// attributes that changes the position and size of the DOM elements
			label: [ElementView.Flags.UPDATE],
			image: [ElementView.Flags.UPDATE],
			// attributes that do not affect the size
			outlineColor: ['@color'],
			fillColor: ['@color'],
	}),

	confirmUpdate: function(...args) {
			let flags = ElementView.prototype.confirmUpdate.call(this, ...args);
			if (this.hasFlag(flags, '@color')) {
					// if only a color is changed, no need to resize the DOM elements
					this.updateColors();
					flags = this.removeFlag(flags, '@color');
			}
			// must return 0
			return flags;
	},

	/* Runs only once while initializing */
	render: function() {
			const {
					vel,
					model
			} = this;
			const body = this.vBody = V('rect').addClass('body');
			const label = this.vLabel = V('text').addClass('label').attr(model.labelAttributes);
			this.vImage = V('image').addClass('image').attr(model.imageAttributes);
			vel.empty().append([
					body,
					label
			]);
			this.update();
			this.updateColors();
			this.translate(); // default element translate method
	},

	update: function() {
			const layout = this.model.layout();
			this.updateBody();
			this.updateImage(layout.$image);
			this.updateLabel(layout.$label);
	},

	updateColors: function() {
			const {
					model,
					vBody
			} = this;
			vBody.attr({
					fill: model.get('fillColor'),
					stroke: model.get('outlineColor')
			});
	},

	updateBody: function() {
			const {
					model,
					vBody
			} = this;
			const {
					width,
					height
			} = model.size();
			const bodyAttributes = {
					width,
					height
			};
			vBody.attr(bodyAttributes);
	},

	updateImage: function($image) {

			const {
					model,
					vImage,
					vel
			} = this;
			const image = model.get('image');
			if (image) {
					if (!vImage.parent()) {
							vel.append(vImage);
					}
					vImage.attr({
							'xlink:href': image,
							x: $image.x,
							y: $image.y
					});

			} else {
					vImage.remove();
			}
	},

	updateLabel: function($label) {

			const {
					model,
					vLabel
			} = this;
			vLabel.attr({
					'text-anchor': 'middle',
					x: $label.x + $label.width / 2,
					y: $label.y + $label.height / 2
			});
			vLabel.text(model.get('label'), {
					textVerticalAnchor: 'middle'
			});
	}
});

erd.Note = Note;
erd.NoteView = NoteView;

export default erd;

