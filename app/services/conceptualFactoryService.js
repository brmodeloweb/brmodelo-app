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
				height: 40
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
			}
		});

	};

	_createIdentifyingRelationship = function() {
		return new erd.IdentifyingRelationship({
			position: {
				x: 10,
				y: 250
			},
			size: {
				width: 80,
				height: 40
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