angular.module('myapp').factory('ConversorService', function(ConceptualService, $uibModal, $q, $log){

		var modelGraph;
		var cs = ConceptualService;
		var ls = {};
		var conversion = {};

		var entityTableMap = new Map();

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
				var cell_associatives = [];
				var cell_extensions = [];

				var all = modelGraph.attributes.cells.models;

				for (element of all){

					if(element.attributes.type === 'erd.Entity') {
						cell_tables.push(element);
					}

					if(element.attributes.type === 'erd.Relationship') {
						cell_relations.push(element);
					}

					if(element.attributes.type === 'erd.BlockAssociative'){
						cell_associatives.push(element);
					}

					if(element.attributes.type === 'erd.ISA'){
						cell_extensions.push(element);
					}

				}

				buildTables(cell_tables).then(function(){

					buildExtensions(cell_extensions).then(function(){

						buildRelations(cell_relations).then(function() {

							buildAssociatives(cell_associatives).then(function() {

								resolve(tables);

							});

						});

					});

				});


				});
		};

		buildExtensions = function(extensions) {
			return $q(function(resolve){
				(function iterate(){
					if(extensions.length == 0){
						resolve();
					} else {
						var extension = extensions.shift();
						var modalInstance = $uibModal.open({
							backdrop  : 'static',
							keyboard  : false,
							animation: true,
							templateUrl: 'angular/view/modal/conversions/extensionConversionModal.html',
							controller:  'ExtensionModalController',
							resolve: {
								params: function () {
									return {'rootName': getExtensionRootName(extension)};
								}
							}
						});
						modalInstance.result.then(function (resp) {
							switch (resp) {
								case "all_tables":
									treatExtensionAll(extension).then(function(){
										iterate();
									});
									break;
								case "one_table":
									treatExtensionOne_table(extension).then(function(){
										iterate();
									});
									break;
								case "children_tables":
									treatExtensionChildrensOnly(extension).then(function(){
										iterate();
									});
									break;
								default:
							}
						});
					}
				})();
			});
		}

		getExtensionRootName = function(extension) {
			for (neighbor of getEntityNeighbors(extension)){
				if(extension.attributes.parentId == neighbor.id){
					return neighbor.attributes.attrs.text.text;
				}
			}
			return "";
		}

		treatExtensionOne_table = function(extension) {
			return $q(function(resolve){
				joinTablesFromRelation(extension).then(function(){
					resolve();
				});
			});
		}

		treatExtensionChildrensOnly = function(extension) {
			return $q(function(resolve){
				var childrens = [];
				var root = {};
				for (neighbor of getEntityNeighbors(extension)){
					if(extension.attributes.parentId != neighbor.id){
						childrens.push(neighbor);
					} else {
						root = neighbor;
					}
				}

				if(getEntityOrRelationNeighbors(root).length > 0){
					var modalInstance = $uibModal.open({
						backdrop  : 'static',
						keyboard  : false,
						animation: true,
						templateUrl: 'angular/view/modal/conversions/alertExtensionConversionModal.html',
						controller:  'ExtensionModalController',
						resolve: {
							params: function () {
								return {'rootName': getExtensionRootName(extension)};
							}
						}
					});
					modalInstance.result.then(function (resp) {
						switch (resp) {
							case "all_tables":
								treatExtensionAll(extension).then(function(){
									resolve();
								});
								break;
							case "one_table":
								treatExtensionOne_table(extension).then(function(){
									resolve();
								});
								break;
							default:
						}
					});
				} else {
					var new_attributes = [];
					new_attributes.push.apply(new_attributes, getPKs(root));
					new_attributes.push.apply(new_attributes, getAttributes(root));
					for (children of childrens) {
						for (attribute of new_attributes) {
							var pi = {
								"name": attribute.attributes.attrs.text.text,
								"PK": attribute.attributes.type === 'erd.Key',
								"FK": false
							}
							entityTableMap.get(children.id).addAttribute(pi);
						}
					}
					resolve();
				}
			});
		}

		treatExtensionAll = function(extension) {
			return $q(function(resolve){
				var childrens = [];
				var root = {};
				for (neighbor of getEntityNeighbors(extension)){
					if(extension.attributes.parentId != neighbor.id){
						childrens.push(neighbor);
					} else {
						root = neighbor;
					}
				}
				for (children of childrens) {
					connectTables(entityTableMap.get(root.id), entityTableMap.get(children.id));
				}
				resolve();
			});
		}

		buildAssociatives = function(associatives) {
			return $q(function(resolve){
				(function iterate(){
					if(associatives.length == 0){
						resolve();
					} else {
							var element = associatives.shift();

							var new_attributes = [];
							new_attributes.push.apply(new_attributes, getPKs(element));
							new_attributes.push.apply(new_attributes, getAttributes(element));

							var tableRelation = entityTableMap.get(element.embeds[0]);

							if(tableRelation != null) {

								for (attribute of new_attributes) {
									var pi = {
										"name": attribute.attributes.attrs.text.text,
										"PK": false,
										"FK": false
									}
									tableRelation.addAttribute(pi);
								}

								var relationTables = getEntityOrRelationNeighbors(element);

								for (toConnect of relationTables) {
									connectTables(tableRelation, entityTableMap.get(toConnect.id));
								}

								iterate();

							} else {
								iterate();
							}
					}
				})();
			});
		}

		buildTables = function(tables) {  
			return $q(function(resolve){

				(function iterate(){
					if(tables.length == 0){
						resolve();
					} else {
							let element = tables.shift();
							if(element != null) {
								let promise = buildTable(element, modelGraph.getNeighbors(element));
								promise.then(function(editedTable) {
									let newTable = ls.insertTable(editedTable);
									entityTableMap.set(element.id, newTable);
									iterate();
								});
							}
					}
				})();

			});
		}

		buildRelations = function(relations) {

			return $q(function(resolve){

				(function iterate() {

					if(relations.length == 0){

						resolve();

					} else {

						var relation = relations.shift();

						var links = modelGraph.getConnectedLinks(relation);

						var relationType = getRelationType(links);

						if(relationType.quantity > 2) {

							createTableFromRelation(relation, true).then(function(){
								iterate();
							});

						} else {
							switch (relationType.type) {
								case "nn":
									treatNNcase(relation, links).then(function(){
										iterate();
									});
									break;
								case "1n":
									treatN1case(relation, links).then(function(){
										iterate();
									});
									break;
								case "n1":
									treatN1case(relation, links).then(function(){
										iterate();
									});
									break;
								case "11":
									treat11case(relation, links).then(function(){
										iterate();
									});
									break;
								default:
									iterate();
							}
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
														return {'attribute': attname,
																		'tableName': table.name};
													}
												}
											});
											modalInstance.result.then(function (resp) {
												if(resp=="new_table"){

													createTableFromAttribute(tables, attribute, entityReference);

												} else {

													var newTable = entityTableMap.get(entityReference.id);

													ls.selectedElement = ls.paper.findViewByModel(newTable);

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

						if(attributes.length == 0) {
							resolve(table);
						}

				})();

			});
		}

		buildTable = function(element, neighbors) {
			return $q(function(resolve, reject) {

				var name = element.attributes.attrs.text.text;
				var x = element.attributes.position.x;
				var y = element.attributes.position.y;
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
			for (link of filterConnections(links)) {
				if(link.attributes.labels != null){
					var card = link.attributes.labels[0].attrs.text.text;
					obj.type = obj.type + card[4];
					obj.quantity += 1;
				}
			}
			return obj;
		}

		getRelationOptionality = function(links) {
			var optionality = "";
			for (link of filterConnections(links)) {
				if(link.attributes.labels != null){
					var card = link.attributes.labels[0].attrs.text.text;
					optionality = optionality + card[1];
				}
			}
			return optionality;
		}

		isN1Optional = function(links){
			for (link of filterConnections(links)) {
				if(link.attributes.labels != null && link.attributes.labels[0].attrs.text.text == '(0, 1)'){
					return true;
				}
			}
			return false;
		}

		is01Optional = function(links){
			const connections = filterConnections(links);
			return connections[0].attributes.labels[0].attrs.text.text == '(0, 1)' && connections[1].attributes.labels[0].attrs.text.text == '(0, 1)';
		}

		buildRelationDescriotion = function(links){
			const connections = filterConnections(links);
			return connections[0].attributes.labels[0].attrs.text.text + " < - > " + connections[1].attributes.labels[0].attrs.text.text;
		}

		getTableNames = function(relation){
			var tableNames = "(";
			for (element of modelGraph.getNeighbors(relation)) {
				if(element.attributes.type === 'erd.Entity') {
					tableNames += " " + element.attributes.attrs.text.text;
				}
			}
			tableNames += " )";
			return tableNames;
		}

		isAutoRelationship = function(relation){
			var entities = [];
			for (element of modelGraph.getNeighbors(relation)) {
				if(element.attributes.type === 'erd.Entity') {
					entities.push(element);
				}
			}
			return (entities.length == 1) && entities[0].attributes.autorelationship;
		}

		getAttributes = function(relation){
			var entities = [];
			for (element of modelGraph.getNeighbors(relation)) {
				if(element.attributes.type === 'erd.Attribute') {
					entities.push(element);
				}
			}
			return entities;
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

		getEntityOrRelationNeighbors = function(relation){
			var entities = [];
			for (element of modelGraph.getNeighbors(relation)) {
				if(element.attributes.type === 'erd.Entity' || element.attributes.type === 'erd.Relationship') {
					entities.push(element);
				}
			}
			return entities;
		}

		getTableType_1 = function(links, relation) {
			var link = links[0];
			var card = link.attributes.labels[0].attrs.text.text;
			if(card != "(1, 1)" && card != "(0, 1)"){
				link = links[1];
			}
			if(link.attributes.source.id != relation.id) {
				return entityTableMap.get(link.attributes.source.id);
			} else {
				return entityTableMap.get(link.attributes.target.id);
			}
		}

		getTableType_2 = function(links, relation) {
			var link = links[0];
			var card = link.attributes.labels[0].attrs.text.text;
			if(card == "(1, 1)" || card == "(0, 1)"){
				link = links[1];
			}
			if(link.attributes.source.id != relation.id) {
				return entityTableMap.get(link.attributes.source.id);
			} else {
				return entityTableMap.get(link.attributes.target.id);
			}
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

		createTableFromRelation = function(relation, allPKs){
			return $q(function(resolve){
				var name = relation.attributes.attrs.text.text;
				var x = relation.attributes.position.x;
				var y = relation.attributes.position.y;

				var table = createTableObject(name, x, y);

				var neighbors = modelGraph.getNeighbors(relation);

				buildAttributes(table, neighbors).then(function(table){
					var newTable = ls.insertTable(table);

					entityTableMap.set(relation.id, newTable);

					ls.selectedElement = ls.paper.findViewByModel(newTable);
					var hasPrimaryKey = false;

					var entityNeighbors = getEntityNeighbors(relation);
					for (entity of entityNeighbors) {
						var column = createFKColumn(entity);
						if(!hasPrimaryKey){
							column.PK = true;
							if(!allPKs){
								hasPrimaryKey = true;
							}
						}
						ls.addColumn(column);
					}
					resolve();
				});
			});
		}

		createTableFrom1NRelation = function(relation, links){
			return $q(function(resolve){
				var name = relation.attributes.attrs.text.text;
				var x = relation.attributes.position.x;
				var y = relation.attributes.position.y;

				var table = createTableObject(name, x, y);

				var neighbors = modelGraph.getNeighbors(relation);

				buildAttributes(table, neighbors).then(function(table){
					var newTable = ls.insertTable(table);

					entityTableMap.set(relation.id, newTable);

					ls.selectedElement = ls.paper.findViewByModel(newTable);

					var entityNeighbors = getEntityNeighbors(relation);

					var sideN = {};

					for (link of filterConnections(links)) {
						if(link.attributes.labels[0].attrs.text.text[4] == 'n'){
							sideN = link;
						}
					}

					for (entity of entityNeighbors) {
						var column = createFKColumn(entity);
							if((entity.id == sideN.attributes.source.id) || (entity.id == sideN.attributes.target.id)){
								column.PK = true;
							}
							ls.addColumn(column);
					}
					resolve();
				});
			});
		}

		createColumnFromRelation = function(relation, links){
			return $q(function(resolve){
				var attributes = getAttributes(relation);
				var pks = getPKs(relation);
				var table2 = getTableType_2(filterConnections(links), relation);
				ls.selectedElement = ls.paper.findViewByModel(table2);
				for (att of attributes) {
					var pi = {
						"name": att.attributes.attrs.text.text,
						"PK": false,
						"FK": false
					}
					ls.addColumn(pi);
				}
				for (pk of pks) {
					var pi = {
						"name": pk.attributes.attrs.text.text,
						"PK": true,
						"FK": false
					}
					ls.addColumn(pi);
				}
				var table1 = getTableType_1(filterConnections(links), relation);
				entityTableMap.set(relation.id, table1);
				connectTables(table1, table2);
				resolve();
			});
		}

		treatNNcase = function(relation, links){
			return $q(function(resolve){
				var optionality = getRelationOptionality(links);
				if(optionality == "11" || optionality == "00"){
					createTableFromRelation(relation, true).then(function(){
						resolve();
					});
				} else {
					createTableFromRelation(relation, false).then(function(){
						resolve();
					});
				}
			});
		}

		treatN1case = function(relation, links){
			return $q(function(resolve){
				if(isN1Optional(links)) {
					var modalInstance = $uibModal.open({
						animation: true,
						templateUrl: 'angular/view/modal/conversions/1nConversionModal.html',
						controller:  'AttributeModalController',
						resolve: {
							params: function () {
								return {'relationName': relation.attributes.attrs.text.text,
												'relationType': buildRelationDescriotion(links),
												'tableNames': getTableNames(relation)
												};
							}
						}
					});
					modalInstance.result.then(function (resp) {
						if(resp=="new_table"){
							createTableFrom1NRelation(relation, links).then(function(){
								resolve();
							});
						} else {
							createColumnFromRelation(relation, links).then(function(){
								resolve();
							});
						}
					});
				} else {
					createColumnFromRelation(relation, links).then(function(){
						resolve();
					});
				}
			});
		}

		treat11case = function(relation, links){
			return $q(function(resolve){
				if(is01Optional(links)) {
					var modalInstance = $uibModal.open({
						animation: true,
						templateUrl: 'angular/view/modal/conversions/1nConversionModal.html',
						controller:  'AttributeModalController',
						resolve: {
							params: function () {
								return {'relationName': relation.attributes.attrs.text.text,
												'relationType': buildRelationDescriotion(links),
												'tableNames': getTableNames(relation)
												};
							}
						}
					});
					modalInstance.result.then(function (resp) {
						if(resp=="new_table"){
							createTableFromRelation(relation, false).then(function(){
								resolve();
							});
						} else {
							createColumnFromRelation(relation, links).then(function(){
								resolve();
							});
						}
					});
				} else {
					if(isAutoRelationship(relation)){
						createColumnFromRelation(relation, links).then(function(){
							resolve();
						});
					} else {
						var modalInstance = $uibModal.open({
							animation: true,
							templateUrl: 'angular/view/modal/conversions/11ConversionModal.html',
							controller:  'AttributeModalController',
							resolve: {
								params: function () {
									return {'relationName': relation.attributes.attrs.text.text,
													'relationType': buildRelationDescriotion(links),
													'tableNames': getTableNames(relation)
													};
								}
							}
						});
						modalInstance.result.then(function (resp) {
							//arrumar isso aqui!!
							if(resp=="new_table"){
								joinTablesFromRelation(relation).then(function(){
									resolve();
								});
							} else {
								createColumnFromRelation(relation, links).then(function(){
									resolve();
								});
							}
						});
					}
				}
			});
		}

		connectTables = function(source, target){
			var obj = {
				"name": "id" + source.attributes.name,
				"type": "Integer",
				"PK": false,
				"FK": true,
				"tableOrigin": {
					"idOrigin": source.id,
					"idLink": ""
				}
			}
			ls.selectedElement = ls.paper.findViewByModel(target);
			ls.addColumn(obj);
		}

		joinTablesFromRelation = function(relation){
			return $q(function(resolve){

				var x = relation.attributes.position.x;
				var y = relation.attributes.position.y;

				var neighbors = modelGraph.getNeighbors(relation);

				var entities = getEntityNeighbors(relation);

				var name = "";

				for (entity of entities) {
					name += entity.attributes.attrs.text.text + "_";

					neighbors.push.apply(neighbors, modelGraph.getNeighbors(entity));
				}

				var table = createTableObject(name, x, y);

				buildAttributes(table, neighbors).then(function(table){
					var newTable = ls.insertTable(table);
					entityTableMap.set(relation.id, newTable);

					ls.selectedElement = ls.paper.findViewByModel(newTable);

					for (entity of entities) {
						entityTableMap.get(entity.id).remove();
						entityTableMap.set(entity.id, newTable);
					}

					resolve();
				});
			});
		}

		createFKColumn = function(entity) {
			var pks = getPKs(entity);
			var attName = "id" + entity.attributes.attrs.text.text;
			if(pks.length > 0) {
				attName = pks[0].attributes.attrs.text.text;
			}
			var obj = {
				"name": attName,
				"type": "Integer",
				"PK": false,
				"FK": true,
				"tableOrigin": {
					"idOrigin": entityTableMap.get(entity.id).id,
					"idLink": ""
					}
			}
			return obj;
		}

		filterConnections = function(links) {
			return links.filter(link => {
				if(link.attributes.type == "erd.Line") {
					return true;
				}
				if(link.attributes.type == "link" && 
					link.attributes.labels[0] != null && 
					link.attributes.labels[0].attrs != null && 
					link.attributes.labels[0].attrs.text != null &&
					link.attributes.labels[0].attrs.text.text != null ) {
					const type = link.attributes.labels[0].attrs.text.text;
					return (type == "(0, n)" || type == "(0, 1)" || type == "(1, 1)" || type == "(1, n)");
				}
				return false;
			});
		}

	return {
		toLogic : _toLogic,
		startConversion : _startConversion
	}

});
