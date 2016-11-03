angular.module('myapp').factory('ConversorService', function(ConceptualService, $uibModal, $q){

		var modelGraph;
		var cs = ConceptualService;
		var conversion = {};

		var tables = [];

		_startConversion = function(){
			_toLogic(conversion);
		}

		_toLogic = function(graph) {
			return $q(function(resolve, reject) {

				tables = [];

				modelGraph = graph;
				conversion = graph;

				var cells = [];

				var all = modelGraph.toJSON().cells;

				for (element of all) {
					if(element.type === 'erd.Entity') {
						cells.push(element);
					}
				}

				(function iterate() {

						if(cells.length == 0){
							resolve(tables);
						}

						var element = cells.shift();

						if(element != null) {
							var promise = buildTable(element, modelGraph.getNeighbors(element));
							promise.then(function(editedTable) {
								tables.push(editedTable);
								iterate();
							});
						} else {
							resolve(tables);
						}

					})();

				});
		};

		buildAttributes = function(table, neighbors) {

			var attributes = [];
			var parents = new Map();

			for (element of neighbors){
				if(element.attributes.type === 'erd.Attribute') {
					attributes.push(element);
				}
			}

			return $q(function(resolve, neighbors) {

				(function iterate() {

						var attribute = attributes.shift();

						if(attribute != null){

							if(attribute.attributes.composed) {

								parents.set(attribute.id, attribute);
								var filhos = modelGraph.getNeighbors(attribute);

								for(filho of filhos){
									if(cs.isAttribute(filho) && parents.get(filho.id) == null){
										attributes.push(filho);
									}
								}

								iterate();

							} else {

									var cardinality = attribute.attributes.cardinality;
									if(cardinality == "(0, n)" || cardinality == "(1, n)") {

											var attname = attribute.attributes.attrs.text.text.replace(/ *\([^)]*\) */g, "");

											var modalInstance = $uibModal.open({
												animation: true,
												templateUrl: 'angular/view/modal/conversions/attributeConversionModal.html',
												controller:  'AttributeModalController',
												resolve: {
													params: function () {
														return {'attribute': attname};
													}
												}
											});
											modalInstance.result.then(function (resp) {
												if(resp=="new_table"){

													createTableFromAttribute(tables, attribute);

												} else {
													for (var i = 0; i < resp; i++) {
														var pi = {
															"name": attname + i,
															"PK": false
														}
														table.columns.push(pi);
													}
												}

												iterate();
											});

										} else {
											var column = {
												"name": attribute.attributes.attrs.text.text,
												"PK": false
											}
											table.columns.push(column);
											iterate();
										}

							}

						}

						if(attributes.length == 0) {
							resolve(table);
						}

				})();

			});
		}

		buildTable = function(element, neighbors) {
			return $q(function(resolve, reject) {
				var table = {
					"name": '',
					"columns": [],
					"connectedTo": [],
					"position": {
						"x": 0,
						"y": 0
					}
				}

				table.name = element.attrs.text.text;
				table.position.x = element.position.x;
				table.position.y = element.position.y;

				buildAttributes(table, neighbors).then(function(resp){
					resolve(resp);
				});

				// for (neighbor of neighbors) {
				//
				// 	if(cs.isAttribute(neighbor)){
				// 		buildAttributes(neighbor, table, new Map());
				// 	}
				//
				// 	if(cs.isKey(neighbor)){
				// 		var key = {
				// 			"name": neighbor.attributes.attrs.text.text,
				// 			"PK": true
				// 		}
				// 		table.columns.push(key);
				// 	}
				//
				// 	if(cs.isRelationship(neighbor)){
				// 		table.connectedTo.push(getConnectedTo(element, neighbor));
				// 	}
				//
				// }

			});
		}

		getConnectedTo = function(elmself, relation){
			var connected = [];

			//for (variable of modelGraph.getNeighbors(relation)) {
				//if (variable.attributes.id != elmself.id && variable != relation) {
				//	connected.push(variable.attributes.attrs.text.text);
				//}
			//}

		return connected;
		}

		createTableFromAttribute = function(tables, reference) {

			var table = {
				"name": '',
				"columns": [],
				"connectedTo": [],
				"position": {
					"x": 0,
					"y": 0
				}
			}

			table.name = reference.attributes.attrs.text.text;
			table.position.x = reference.attributes.position.x;
			table.position.y = reference.attributes.position.y -100;

			var column = {
				"name": name,
				"PK": true
			}

			table.columns.push(column);

			tables.push(table);

		}

	return {
		toLogic : _toLogic,
		startConversion : _startConversion
	}

});
