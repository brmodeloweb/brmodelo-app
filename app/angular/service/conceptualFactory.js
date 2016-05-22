angular.module('myapp').factory('ConceptualFactory', function(){

	var erd = joint.shapes.erd;

	_createEntity = function() {
		return new erd.Entity({
			position: {
				x: 25,
				y: 10
			},
			size: {
				width: 80,
				height: 40
			},
			attrs: {
				text: {
					text: 'Entidade'
				},
				'.outer': {
						fill: '#FFFFFF',
						stroke: 'black'
				}
			}
		});
	};

	_createIsa = function() {
		return new erd.ISA({
			position: {
				x: 40,
				y: 70
			},
			size: {
				width: 50,
				height: 40
			}
		});
	};

	_createRelationship = function() {
		return new erd.Relationship({
			position: {
				x: 25,
				y: 130
			},
			size: {
				width: 85,
				height: 45
			},
			attrs: {
				text: {
					text: 'Rel'
				},
				'.outer': {
						fill: '#FFFFFF',
						stroke: 'black'
				}
			}
		});
	};

	_createAssociative = function() {
		return new erd.Associative({
			position: {
				x: 25,
				y: 190
			},
			size: {
				width: 80,
				height: 40
			},
			attrs: {
				'.outer': {
						fill: '#FFFFFF',
						stroke: 'black'
				},
				'.inner': {
						fill: '#FFFFFF',
						stroke: 'black'
				}
			}
		});
	};

	_createAttribute = function() {
		return new erd.Attribute({
			position: {
				x: 65,
				y: 260
			},
			attrs: {
				text: {
					text: 'Atributo'
				}
			}
		});
	};

	_createKey = function() {
		return new erd.Key({
			position: {
				x: 65,
				y: 300
			},
			attrs: {
				text: {
					text: 'Chave'
				}
			}
		});
	};

	return {
		createEntity : _createEntity,
		createAttribute : _createAttribute,
		createIsa : _createIsa,
		createRelationship : _createRelationship,
		createKey : _createKey,
		createAssociative : _createAssociative
	}

});