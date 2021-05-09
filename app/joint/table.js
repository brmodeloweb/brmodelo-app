import * as joint from "jointjs";
import _ from "lodash";

const uml = joint.shapes.uml;

uml.Class = joint.shapes.basic.Generic.extend({

    markup: [
        '<g class="rotatable">',
        '<g class="scalable">',
        '<rect class="uml-class-name-rect"/><rect class="uml-class-attrs-rect"/><rect class="uml-class-methods-rect"/>',
        '</g>',
        '<text class="uml-class-name-text"/><text class="uml-class-attrs-text"/><text class="uml-class-methods-text"/>',
        '</g>'
    ].join(''),

    defaults: _.defaultsDeep({

        type: 'uml.Class',

        attrs: {
            rect: { 'width': 200 },

            '.uml-class-name-rect': { 'stroke': 'black', 'stroke-width': 0.5, 'fill': '#3498db' },
            '.uml-class-attrs-rect': { 'stroke': 'black', 'stroke-width': 0.5, 'fill': '#fff' },
            '.uml-class-methods-rect': { 'stroke': 'black', 'stroke-width': 0.5, 'fill': '#fff' },

            '.uml-class-name-text': {
                'ref': '.uml-class-name-rect', 'ref-y': .5, 'ref-x': .5, 'text-anchor': 'middle', 'y-alignment': 'middle', 'font-weight': 'bold',
                'fill': 'black', 'font-size': 12, 'font-family': 'Times New Roman'
            },
            '.uml-class-attrs-text': {
                'ref': '.uml-class-attrs-rect', 'ref-y': 5, 'ref-x': 5,
                'fill': 'black', 'font-size': 12, 'font-family': 'Times New Roman'
            },
            '.uml-class-methods-text': {
                'ref': '.uml-class-methods-rect', 'ref-y': 5, 'ref-x': 5,
                'fill': 'black', 'font-size': 12, 'font-family': 'Times New Roman'
            }
        },

        name: [],
        attributes: [],
        methods: [],
        objects: []

    }, joint.shapes.basic.Generic.prototype.defaults),

    initialize: function () {

        this.on('change:name change:attributes change:methods', function () {
            this.updateRectangles();
            this.trigger('uml-update');
        }, this);

        this.updateRectangles();

        joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);
    },

    getClassName: function () {
        return this.get('name');
    },

    addAttribute: function (obj) {
        if (obj.PK) {
            obj.name = obj.name + ": PK";
        }

        if (obj.FK) {
            obj.name = obj.name + ": FK";
        }

        this.get('attributes').push(obj.name);
        this.get('objects').push(obj);
        this.updateRectangles();
        this.trigger('uml-update');
    },

    deleteColumn: function (index) {
        this.get('attributes').splice(index, 1);
        this.get('objects').splice(index, 1);
        this.updateRectangles();
        this.trigger('uml-update');
    },

    editColumn: function (index, name, object) {
        this.get('attributes')[index] = name;
        this.get('objects')[index] = object;
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

        _.each(rects, function (rect) {

            var lines = _.isArray(rect.text) ? rect.text : [rect.text];
            var rectHeight = lines.length * 20 + 20;

            attrs['.uml-class-' + rect.type + '-text'].text = lines.join('\n');
            attrs['.uml-class-' + rect.type + '-rect'].height = rectHeight;
            attrs['.uml-class-' + rect.type + '-rect'].transform = 'translate(0,' + offsetY + ')';

            offsetY += rectHeight;
        });

    }

});

uml.ClassView = joint.dia.ElementView.extend({
    initialize: function () {
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);
        this.listenTo(this.model, 'uml-update', function () {
            this.update();
            this.resize();
        });
    }
});

export default uml;