joint.shapes.erd = {};

joint.shapes.erd.Entity = joint.dia.Element.extend({

    markup: '<g class="rotatable"><g class="scalable"><polygon class="outer"/><polygon class="inner"/></g><text/></g>',

    defaults: joint.util.deepSupplement({

        type: 'erd.Entity',
        supertype: 'Entity',
        isExtended: false,
        autorelationship: false,
        size: { width: 150, height: 60 },
        attrs: {
            '.outer': {
                fill: '#2ECC71', stroke: '#27AE60', 'stroke-width': 1,
                points: '100,0 100,60 0,60 0,0'
            },
            '.inner': {
                fill: '#2ECC71', stroke: '#27AE60', 'stroke-width': 1,
                points: '95,5 95,55 5,55 5,5',
                display: 'none'
            },
            text: {
                text: 'Entity',
                'font-family': 'Arial', 'font-size': 14,
                ref: '.outer', 'ref-x': .5, 'ref-y': .5,
                'x-alignment': 'middle', 'y-alignment': 'middle'
            }
        }

    }, joint.dia.Element.prototype.defaults)
});

joint.shapes.erd.WeakEntity = joint.shapes.erd.Entity.extend({

    defaults: joint.util.deepSupplement({

        type: 'erd.WeakEntity',
        supertype: 'Entity',
        attrs: {
            '.inner' : { display: 'auto' },
            text: { text: 'Weak Entity' }
        }

    }, joint.shapes.erd.Entity.prototype.defaults)
});

joint.shapes.erd.Relationship = joint.dia.Element.extend({

    markup: '<g class="rotatable"><g class="scalable"><polygon class="outer"/><polygon class="inner"/></g><text/></g>',

    defaults: joint.util.deepSupplement({

        type: 'erd.Relationship',
        supertype: 'Relationship',
        autorelationship: false,
        size: { width: 80, height: 80 },
        attrs: {
            '.outer': {
                fill: '#3498DB', stroke: '#2980B9', 'stroke-width': 1,
                points: '40,0 80,40 40,80 0,40'
            },
            '.inner': {
                fill: '#3498DB', stroke: '#2980B9', 'stroke-width': 1,
                points: '40,5 75,40 40,75 5,40',
                display: 'none'
            },
            text: {
                text: 'Relationship',
                'font-family': 'Arial', 'font-size': 12,
                ref: '.', 'ref-x': .5, 'ref-y': .5,
                'x-alignment': 'middle', 'y-alignment': 'middle'
            }
        }

    }, joint.dia.Element.prototype.defaults)
});

joint.shapes.erd.IdentifyingRelationship = joint.shapes.erd.Relationship.extend({

    defaults: joint.util.deepSupplement({

        type: 'erd.IdentifyingRelationship',
        supertype: 'Relationship',
        attrs: {
            '.inner': { display: 'auto' },
            text: { text: 'Identifying' }
        }

    }, joint.shapes.erd.Relationship.prototype.defaults)
});

joint.shapes.erd.Attribute = joint.dia.Element.extend({

	markup : '<g class="rotatablex"><g class="scalable"><ellipse class="outer"/><ellipse class="inner"/></g><text/></g>',

	defaults : joint.util.deepSupplement({

		type : 'erd.Attribute',
    supertype: 'Attribute',
    multivalued: false,
    composed: false,
		size : {
			width : 15,
			height : 15
		},
		attrs : {
			'ellipse' : {
				stroke : 'black',
				'stroke-width' : 1,
				transform : 'translate(0, 15)',
				opacity : .6
			},
			'.outer' : {
				cy : 0,
				rx : 30,
				ry : 15,
				fill : 'white'
			},
			'.inner' : {
				cx : 10, cy : 25, rx : 45, ry : 20,
				fill : 'black',
				display : 'none'
			},
			text : {
        text: 'Atributo',
        ref: '.',
        'x-alignment': 'middle',
        'ref-y': -5
			}
		}

	}, joint.dia.Element.prototype.defaults)

});

joint.shapes.erd.Key = joint.shapes.erd.Attribute.extend({

    defaults: joint.util.deepSupplement({

        type: 'erd.Key',

        attrs: {
            ellipse: { 'stroke-width': 2 },
            '.outer' : {
           fill : 'black'
         },
            text: { text: 'key', 'font-weight': 'bold', 'text-decoration': 'underline' }
        }
    }, joint.shapes.erd.Attribute.prototype.defaults)
});

joint.shapes.erd.Normal = joint.shapes.erd.Attribute.extend({

    defaults: joint.util.deepSupplement({

        type: 'erd.Normal',

        attrs: { text: { text: 'Normal' }}

    }, joint.shapes.erd.Attribute.prototype.defaults)
});

joint.shapes.erd.ISA = joint.dia.Element.extend({

    markup: '<g class="rotatable"><g class="scalable"><polygon/></g><text/></g>',

    defaults: joint.util.deepSupplement({

        type: 'erd.ISA',
        supertype: 'Inheritance',
        parentId: null,
        size: { width: 100, height: 50 },
        attrs: {
            polygon: {
                //25,0 15,50 35,50
                points: '25,0 0,50 50,50',
                fill: '#F1C40F', stroke: '#F39C12', 'stroke-width': 1
            }
        }

    }, joint.dia.Element.prototype.defaults)

});

joint.shapes.erd.Line = joint.dia.Link.extend({

    defaults: { type: 'erd.Line' },
    attrs: {
            '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z', fill: '#34495e', stroke: '#2c3e50' },
            '.connection': { stroke: '#2c3e50'}
          }

});


