angular.module('myapp').factory('ConversorService', function(ConceptualService, $uibModal, $q, $log){

		var modelGraph;
		var cs = ConceptualService;
		var ls = {};
		var conversion = {};

		var entityTableMap = new Map();
		var tableEntityMap = new Map();

		var tables = [];

		_startConversion = function(){
			_toLogic(conversion);
		}

		_toLogic = function(graph, logicService) {

			ls = logicService;

			return $q(function(resolve, reject) {

				tables = [];

				modelGraph = graph;
				conversion = graph;

				var cell_tables = [];
				var cell_relations = [];

				var all = modelGraph.toJSON().cells;

				for (element of all) {
					if(element.type === 'erd.Entity') {
						cell_tables.push(element);
					}

					if(element.type === 'erd.Relationship') {
						cell_relations.push(element);
					}
				}

				(function iterate() {

						if(cell_tables.length == 0){
							var relation_promise = buildRelations(cell_relations);
							relation_promise.then(function() {
								resolve(tables);
							});
						}

						var element = cell_tables.shift();

						if(element != null) {
							var promise = buildTable(element, modelGraph.getNeighbors(element));
							promise.then(function(editedTable) {
								var newTable = ls.insertTable(editedTable);
								entityTableMap.set(element.id, newTable);
								tableEntityMap.set(newTable.id, element.id);
								iterate();
							});
						}

					})();

				});
		};

		buildRelations = function(relations) {

			return $q(function(resolve){

				(function iterate() {

					if(relations.length == 0){

						resolve();

					} else {

						var relation = relations.shift();

						var links = modelGraph.getConnectedLinks(relation);

						var relationType = getRelationType(links);

						if(relationType.type == "nn"){
							var name = relation.attrs.text.text;
							var x = relation.position.x;
							var y = relation.position.y;

							var table = createTableObject(name, x, y);

							var neighbors = modelGraph.getNeighbors(relation);

							buildAttributes(table, neighbors).then(function(table){
								var newTable = ls.insertTable(table);

								ls.selectedElement = ls.paper.findViewByModel(newTable);
								var entityNeighbors = getEntityNeighbors(relation);
								for (entity of entityNeighbors) {
									ls.addColumn(createFKColumn(entity.attributes));
								}

								iterate();
							});
						} else {
							iterate();
						}

					}

				})();

			});

		}

		buildAttributes = function(table, neighbors, entityReference) {

			var attributes = [];
			var parents = new Map();

			for (element of neighbors){
				if(element.attributes.type === 'erd.Attribute' ||  element.attributes.type === 'erd.Key') {
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

													createTableFromAttribute(tables, attribute, entityReference);

												} else {

													var newTable = entityTableMap.get(entityReference.id);

													ls.selectedElement = ls.paper.findViewByModel(newTable);;

													for (var i = 0; i < resp; i++) {
														var pi = {
															"name": attname + i,
															"PK": attribute.attributes.type === 'erd.Key',
															"FK": false
														}
														ls.addColumn(pi);
													}
												}

											});

											iterate();

										} else {
											var column = {
												"name": attribute.attributes.attrs.text.text,
												"PK": attribute.attributes.type === 'erd.Key'
											}
											table.columns.push(column);
											iterate();
										}

							}

						}

						console.log(attributes);
						if(attributes.length == 0) {
							resolve(table);
						}

				})();

			});
		}

		buildTable = function(element, neighbors) {
			return $q(function(resolve, reject) {

				var name = element.attrs.text.text;
				var x = element.position.x;
				var y = element.position.y;
				var table = createTableObject(name, x, y);

				buildAttributes(table, neighbors, element).then(function(resp){
					resolve(resp);
				});

			});
		}

		createTableFromAttribute = function(tables, reference, entityReference) {
			var name = reference.attributes.attrs.text.text;

			name = name.replace(/ *\([^)]*\) */g, "");

			var x = reference.attributes.position.x;
			var y = reference.attributes.position.y -100;

			var table = createTableObject(name, x, y);

			var column = {
				"name": "nome",
				"PK": true,
				"FK": false,
				"type": "VARCHAR"
			}

			table.columns.push(column);
			var newTable = ls.insertTable(table);

			ls.selectedElement = ls.paper.findViewByModel(newTable);

			ls.addColumn(createFKColumn(entityReference));
		}

		createTableObject = function(name, x, y){
			var table = {
				"name": name,
				"columns": [],
				"connectedTo": [],
				"position": {
					"x": x,
					"y": y
				}
			}
			return table;
		}

		getRelationType = function(links){
			var obj = {
				'type': "",
				'quantity': 0
			}
			for (link of links) {
				if(link.attributes.labels != null){
					var card = link.attributes.labels[0].attrs.text.text;
					obj.type = obj.type + card[4];
					obj.quantity += 1;
				}
			}
			return obj;
		}

		getEntityNeighbors = function(relation){
			var entities = [];
			for (element of modelGraph.getNeighbors(relation)) {
				if(element.attributes.type === 'erd.Entity') {
					entities.push(element);
				}
			}
			return entities;
		}

		getPKs = function(relation){
			var entities = [];
			for (element of modelGraph.getNeighbors(relation)) {
				if(element.attributes.type === 'erd.Key') {
					entities.push(element);
				}
			}
			return entities;
		}

		createFKColumn = function(entity) {
			console.log(entity);
			var pks = getPKs(entity);
			var attName = "id" + entity.attrs.text.text;
			if(pks.length > 0) {
				attName = pks[0].attributes.attrs.text.text;
			}
			var obj = {
				"name": attName,
				"type": "Integer",
				"PK": true,
				"FK": true,
				"tableOrigin": {
					"idOrigin": entityTableMap.get(entity.id).id,
					"idLink": ""
					}
			}
			return obj;
		}

	return {
		toLogic : _toLogic,
		startConversion : _startConversion
	}

});
