import { dia } from '@joint/core';

const uml = {};

uml.Abstract = dia.Element.define('uml.Abstract', {
    size: { width: 200, height: 100 },
    attrs: {
        rect: { 'width': 200 },

        '.uml-class-name-rect': { 'stroke': 'black', 'stroke-width': 0.5, 'fill': 'lightgray' },
        '.uml-class-attrs-rect': { 'stroke': 'black', 'stroke-width': 0.5, 'fill': '#fff' },
        '.uml-class-methods-rect': { 'stroke': 'black', 'stroke-width': 0.5, 'fill': '#fff' },

        '.uml-class-name-text': {
            'ref': '.uml-class-name-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle', 'font-weight': 'bold',
            'fill': 'black', 'font-size': 12, 'font-family': 'BlinkMacSystemFont,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif'
        },
        '.uml-class-attrs-text': {
            'ref': '.uml-class-attrs-rect', 'ref-y': 5, 'ref-x': 5,
            'fill': 'black', 'font-size': 12, 'font-family': 'BlinkMacSystemFont,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif'
        },
        '.uml-class-methods-text': {
            'ref': '.uml-class-methods-rect', 'ref-y': 5, 'ref-x': 5,
            'fill': 'black', 'font-size': 12, 'font-family': 'BlinkMacSystemFont,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif'
        }
    },

    name: [],
    attributes: [],
    methods: [],
    objects: []
}, {
    markup: [{
        tagName: 'g',
        selector: 'rotatable',
        attributes: { 'class': 'rotatable' },
        children: [{
            tagName: 'g',
            selector: 'scalable',
            attributes: { 'class': 'scalable' },
            children: [{
                tagName: 'rect',
                selector: '.uml-class-name-rect'
            }, {
                tagName: 'rect',
                selector: '.uml-class-attrs-rect'
            }, {
                tagName: 'rect',
                selector: '.uml-class-methods-rect'
            }]
        }, {
            tagName: 'text',
            selector: '.uml-class-name-text'
        }, {
            tagName: 'text',
            selector: '.uml-class-attrs-text'
        }, {
            tagName: 'text',
            selector: '.uml-class-methods-text'
        }],
    }],
    useCSSSelectors: true,

    initialize: function () {
        dia.Element.prototype.initialize.apply(this, arguments);
        this.on('change:name change:attributes change:methods', function () {
            this.updateRectangles();
            this.trigger('uml-update');
        }, this);

        this.updateRectangles();
    },

    getClassName: function () {
        return this.get('name');
    },

    saveView: function (view) {
        this.set('attributes', view.columns.map(column => column.name));
        this.set('objects', view.basedIn);
        this.set('queryConditions', view.queryConditions);
        this.updateRectangles();
        this.trigger('uml-update');
    },

    addAttributes: function (objects) {
        objects.forEach(({ name }) => this.get('attributes').push(name));
        this.get('objects').push(objects);
        this.updateRectangles();
        this.trigger('uml-update');
    },

    updateRectangles: function () {
        var attrs = this.get('attrs');

        var rects = [
            { type: 'name', text: this.getClassName() },
            { type: 'attrs', text: this.get('attributes') },
            { type: 'methods', text: this.get('methods') }
        ];

        var offsetY = 0;

		rects.forEach(rect => {
			var lines = Array.isArray(rect.text) ? rect.text : [rect.text];
			var rectHeight = lines.length * 20 + 20;
			attrs['.uml-class-' + rect.type + '-text'].text = lines.join('\n');
			attrs['.uml-class-' + rect.type + '-rect'].height = rectHeight;
			attrs['.uml-class-' + rect.type + '-rect'].transform = 'translate(0,' + offsetY + ')';

			offsetY += rectHeight;
		});

    },

    getType: function() {
        return "View"
    }

});

const updateSize = function() {
	const nameNode = this.findNode(".uml-class-name-text");
	const columnsNode = this.findNode(".uml-class-attrs-text");
	if (!nameNode || !columnsNode) return;
	const nameBox = nameNode.getBBox();
	const columnsBox = columnsNode.getBBox();
	const elementWidth = Math.max(nameBox.width, columnsBox.width);
	const currentSize = this.model.get('size');

	const newWidth = elementWidth > 100 ? elementWidth + 15 : currentSize.width;

	const height = this.findNode(".uml-class-attrs-rect").getBBox().height;
	const newHeight = height > 40 ? height + 40 : currentSize.height;

	this.model.resize(newWidth, newHeight);

	setTimeout(() => {
	this.model.graph.getConnectedLinks(this.model).forEach(link => {
		link.set('source', link.get('source'));
		link.set('target', link.get('target'));
		const lv = this.paper.findViewByModel(link);
			if (lv?.update) lv.update();
		});
	}, 100);

	this.update();
}

uml.AbstractView = dia.ElementView.extend({
    initialize: function () {
        dia.ElementView.prototype.initialize.apply(this, arguments);
    },
	updateSize: updateSize
});

export default uml;