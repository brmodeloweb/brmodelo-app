angular.module('myapp').factory('ConceptualFactory', function(){

	var erd = joint.shapes.erd;

	_createEntity = function() {
		return new erd.Entity({
			position: {
				x: 10,
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

	_createAttribute = function() {
		return new erd.Normal({
			position: {
				x: 100,
				y: 10
			},
			size: {
				width: 80,
				height: 40
			},
			attrs: {
				text: {
					text: 'Atributo'
				},
				'.outer': {
						fill: '#FFFFFF'
				}
			}
		});
	};

	_createIsa = function() {
		return new erd.ISA({
			position: {
				x: 10,
				y: 70
			},
			size: {
				width: 80,
				height: 40
			},
			attrs: {
				polygon: {
						fill: '#FFFFFF'
				}
			}
		});
	};

	_createKey = function() {
		return new erd.Key({
			position: {
				x: 100,
				y: 70
			},
			size: {
				width: 80,
				height: 40
			},
			attrs: {
				text: {
					text: 'Chave'
				},
				'.outer': {
						fill: '#FFFFFF'
				}
			}
		});
	};

	_createRelationship = function() {
		return new erd.Relationship({
			position: {
				x: 10,
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

	_createMultivalued = function() {
		return new erd.Multivalued({
			position: {
				x: 100,
				y: 130
			},
			size: {
				width: 80,
				height: 40
			},
			attrs: {
				text: {
					text: 'Mult valor'
				},
				'ellipse': {
						transform: 'translate(50, 25)'
				},
				'.outer': {
						stroke: '#D35400', 'stroke-width': 2,
						cx: 0, cy: 0, rx: 50, ry: 25,
						fill: '#FFFFFF'
				},
				'.inner': {
						stroke: '#D35400',
						fill: '#FFFFFF'
				}
			}
		});
	};

	_createWeakEntity = function() {
		return new erd.WeakEntity({
			position: {
				x: 10,
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

	_createDerived = function() {
		return new erd.Derived({
			position: {
				x: 100,
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
				'ellipse': {
						transform: 'translate(50, 25)'
				},
				'.outer': {
						stroke: '#D35400', 'stroke-width': 2,
						cx: 0, cy: 0, rx: 50, ry: 25,
						fill: '#FFFFFF'
				},
				'.inner': {
						stroke: '#D35400',
						fill: '#FFFFFF'
				}
			}
		});

	};

	_createIdentifyingRelationship = function() {
		return new erd.IdentifyingRelationship({
			position: {
				x: 10,
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

	return {
		createEntity : _createEntity,
		createAttribute : _createAttribute,
		createIsa : _createIsa,
		createKey : _createKey,
		createRelationship : _createRelationship,
		createMultivalued : _createMultivalued,
		createWeakEntity : _createWeakEntity,
		createDerived : _createDerived,
		createIdentifyingRelationship : _createIdentifyingRelationship
	}

});