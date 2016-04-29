angular.module('myapp').factory('LogicFactory', function(){

	var logic = joint.shapes.uml;

	console.log(logic);

	_createTable = function() {
		return new logic.Class({
        position: { x:15  , y: 15 },
        size: { width: 100, height: 100 },
        name: 'Entidade',
        attributes: ['id: Number', 'nome: String'],
    //    methods: ['+ isCompatible(bG: String): Boolean'],
        attrs: {
            '.uml-class-name-rect': {
                fill: '#ff8450',
                stroke: '#fff',
                'stroke-width': 0.5,
            },
            '.uml-class-attrs-rect, .uml-class-methods-rect': {
                fill: '#fe976a',
                stroke: '#fff',
                'stroke-width': 0.5
            },
            '.uml-class-attrs-text': {
                ref: '.uml-class-attrs-rect',
                'ref-y': 0.5,
                'y-alignment': 'middle'
            },
            '.uml-class-methods-text': {
                ref: '.uml-class-methods-rect',
                'ref-y': 0.5,
                'y-alignment': 'middle'
            }
        }
    });
	}

	return {
		createTable : _createTable
	}

});