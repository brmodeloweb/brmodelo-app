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
						stroke: '#8deeee'
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
			},
			attrs: {
				polygon: {
						fill: '#FFFFFF'
				}
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
				width: 80,
				height: 50
			},
			attrs: {
				text: {
					text: 'Rel'
				},
				'.outer': {
						fill: '#FFFFFF'
				}
			}
		});

	};

	_createWeakEntity = function() {
		return new erd.WeakEntity({
			position: {
				x: 25,
				y: 190
			},
			size: {
				width: 80,
				height: 40
			},
			attrs: {
				text: {
					text: 'Fraca'
				},
				'.outer': {
						fill: '#FFFFFF', stroke: '#27AE60'
				},
				'.inner': {
						fill: '#FFFFFF', stroke: '#27AE60',
				},
			}
		});
	};

	_createIdentifyingRelationship = function() {
		return new erd.IdentifyingRelationship({
			position: {
				x: 25,
				y: 245
			},
			size: {
				width: 85,
				height: 60
			},
			attrs: {
					'.outer': {
							fill: '#ffffff', stroke: '#2980B9'
					},
					'.inner': {
							fill: '#ffffff', stroke: '#2980B9'
					},
					text: {
							text: 'Identificada'
					}
			}
		});
	};

	_createAttribute = function() {
		return new erd.Attribute({
			position: {
				x: 65,
				y: 335
			},
			attrs: {
				text: {
						text: 'Atributo'
				}
			}
		});
	};

	return {
		createEntity : _createEntity,
		createAttribute : _createAttribute,
		createIsa : _createIsa,
		createRelationship : _createRelationship,
		createWeakEntity : _createWeakEntity,
		createIdentifyingRelationship : _createIdentifyingRelationship
	}

});