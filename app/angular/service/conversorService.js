import angular from "angular";
import conceptualService from "../service/conceptualService"
import conversionOptionModal from "../components/conversionOptionModal";
import { buildColumn } from "./columnService";

const logicConversorService = (ConceptualService, $uibModal) => {

	var modelGraph;
	var cs = ConceptualService;
	var ls = {};
	var conversion = {};

	var entityTableMap = new Map();

	var tables = [];

	const _startConversion = () => _toLogic(conversion);

	const _toLogic = (graph, logicService) => {

		ls = logicService;

		return new Promise((resolve, reject) => {

			tables = [];

			modelGraph = graph;
			conversion = graph;

			const cell_tables = [];
			const cell_relations = [];
			const cell_associatives = [];
			const cell_extensions = [];

			const allElements = modelGraph.attributes.cells.models;

			allElements.forEach(element => {
				switch (element.attributes.type) {
					case 'erd.Entity':
						cell_tables.push(element);
						break;
					case 'erd.Relationship':
						cell_relations.push(element);
						break;
					case 'erd.BlockAssociative':
						cell_associatives.push(element);
						break;
					case 'erd.ISA':
						cell_extensions.push(element);
						break;
					default:
						break;
				}
			})

			buildTables(cell_tables)
				.then(() => buildExtensions(cell_extensions)
				.then(() => buildRelations(cell_relations)
				.then(() => buildAssociatives(cell_associatives)
				.then(() => resolve(tables)))));
		});
	};

	const buildExtensions = (extensions) => {
		return new Promise((resolve) => {
			(function iterate() {
				if (extensions.length == 0) {
					resolve();
				} else {
					const extension = extensions.shift();
					const modalInstance = $uibModal.open({
						backdrop: 'static',
						keyboard: false,
						animation: true,
						template: '<conversion-option-modal suggested-name="$ctrl.suggestedName" title="$ctrl.title" options="$ctrl.options" summary="$ctrl.summary" close="$close(result)"></conversion-option-modal>',
						controller: function () {
							const $ctrl = this;
							$ctrl.title = `Assistente de conversão - Especialização`;
							$ctrl.summary = `O que deseja fazer com a herança partindo da tabela ${getExtensionRootName(extension)}?`;
							$ctrl.options = [
								{ "label": "Uso de uma tabela para cada entidade", "value": "all_tables" },
								{ "label": "Uso de uma única tabela para toda hierarquia", "value": "one_table" },
								{ "label": "Uso de uma tabela apenas para entidade(s) especializada(s)", "value": "children_tables" }
							]
						},
						controllerAs: '$ctrl',
					});
					modalInstance.result.then((response) => {
						switch (response.value) {
							case "all_tables":
								treatExtensionAll(extension).then(() => {
									iterate();
								});
								break;
							case "one_table":
								treatExtensionOne_table(extension).then(() => {
									iterate();
								});
								break;
							case "children_tables":
								treatExtensionChildrensOnly(extension).then(() => {
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

	const getExtensionRootName = (extension) => {
		for (const neighbor of getEntityNeighbors(extension)) {
			if (extension.attributes.parentId == neighbor.id) {
				return neighbor.attributes.attrs.text.text;
			}
		}
		return "";
	}

	const treatExtensionOne_table = (extension) => {
		return new Promise((resolve) => {
			joinTablesFromRelation(extension).then(function () {
				resolve();
			});
		});
	}

	const treatExtensionChildrensOnly = (extension) => {
		return new Promise((resolve) => {
			var childrens = [];
			var root = {};
			for (const neighbor of getEntityNeighbors(extension)) {
				if (extension.attributes.parentId != neighbor.id) {
					childrens.push(neighbor);
				} else {
					root = neighbor;
				}
			}

			if (getEntityOrRelationNeighbors(root).length > 0) {
				var modalInstance = $uibModal.open({
					backdrop: 'static',
					keyboard: false,
					animation: true,
					templateUrl: 'angular/view/modal/conversions/alertExtensionConversionModal.html',
					controller: 'ExtensionModalController',
					resolve: {
						params: function () {
							return { 'rootName': getExtensionRootName(extension) };
						}
					}
				});
				modalInstance.result.then((resp) => {
					switch (resp) {
						case "all_tables":
							treatExtensionAll(extension).then(() => resolve());
							break;
						case "one_table":
							treatExtensionOne_table(extension).then(() => resolve());
							break;
						default:
					}
				});
			} else {
				var new_attributes = [];
				new_attributes.push.apply(new_attributes, getPKs(root));
				new_attributes.push.apply(new_attributes, getAttributes(root));
				for (const children of childrens) {
					for (const attribute of new_attributes) {
						const column = buildColumn({
							name: attribute.attributes.attrs.text.text,
							PK: attribute.attributes.type === 'erd.Key',
						});
						entityTableMap.get(children.id).addAttribute(column);
					}
				}
				resolve();
			}
		});
	}

	const treatExtensionAll = (extension) => {
		return new Promise((resolve) => {
			var childrens = [];
			var root = {};
			for (const neighbor of getEntityNeighbors(extension)) {
				if (extension.attributes.parentId != neighbor.id) {
					childrens.push(neighbor);
				} else {
					root = neighbor;
				}
			}
			for (const children of childrens) {
				connectTables(entityTableMap.get(root.id), entityTableMap.get(children.id));
			}
			resolve();
		});
	}

	const buildAssociatives = (associatives) => {
		return new Promise((resolve) => {
			(function iterate() {
				if (associatives.length == 0) {
					resolve();
				} else {
					var element = associatives.shift();

					var new_attributes = [];
					new_attributes.push.apply(new_attributes, getPKs(element));
					new_attributes.push.apply(new_attributes, getAttributes(element));

					var tableRelation = entityTableMap.get(element.embeds[0]);

					if (tableRelation != null) {

						for (const attribute of new_attributes) {
							const column = buildColumn({
								name: attribute.attributes.attrs.text.text
							});
							tableRelation.addAttribute(column);
						}

						var relationTables = getEntityOrRelationNeighbors(element);

						for (const toConnect of relationTables) {
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

	const buildTables = (tables) => {
		return new Promise((resolve) => {
			(function iterate() {
				if (tables.length == 0) {
					resolve();
				} else {
					const element = tables.shift();
					if (element != null) {
						const promise = buildTable(element, modelGraph.getNeighbors(element));
						promise.then((editedTable) => {
							const newTable = ls.insertTable(editedTable);
							entityTableMap.set(element.id, newTable);
							iterate();
						});
					}
				}
			})();
		});
	}

	const buildRelations = (relations) => {
		return new Promise((resolve) => {
			(function iterate() {
				if (relations.length == 0) {
					resolve();
				} else {
					const relation = relations.shift();
					const links = modelGraph.getConnectedLinks(relation);
					const relationType = getRelationType(links);
					if (relationType.quantity > 2) {
						createTableFromRelation(relation, true).then(function () {
							iterate();
						});
					} else {
						switch (relationType.type) {
							case "nn":
								treatNNcase(relation, links).then(() => iterate());
								break;
							case "1n":
								treatN1case(relation, links).then(() => iterate());
								break;
							case "n1":
								treatN1case(relation, links).then(() => iterate());
								break;
							case "11":
								treat11case(relation, links).then(() => iterate());
								break;
							default:
								iterate();
						}
					}
				}
			})();
		});
	}

	const buildAttributes = function (table, neighbors, entityReference) {

		var attributes = [];
		var parents = new Map();

		for (const element of neighbors) {
			if (element.attributes.type === 'erd.Attribute' || element.attributes.type === 'erd.Key') {
				attributes.push(element);
			}
		}

		return new Promise((resolve, neighbors) => {

			(function iterate() {

				var attribute = attributes.shift();

				if (attribute != null) {

					if (attribute.attributes.composed) {

						parents.set(attribute.id, attribute);
						var filhos = modelGraph.getNeighbors(attribute);

						for (const filho of filhos) {
							if (cs.isAttribute(filho) && parents.get(filho.id) == null) {
								attributes.push(filho);
							}
						}

						iterate();

					} else {

						var cardinality = attribute.attributes.cardinality;
						if (cardinality == "(0, n)" || cardinality == "(1, n)") {

							var attname = attribute.attributes.attrs.text.text.replace(/ *\([^)]*\) */g, "");

							var modalInstance = $uibModal.open({
								animation: true,
								templateUrl: 'angular/view/modal/conversions/attributeConversionModal.html',
								controller: 'AttributeModalController',
								resolve: {
									params: function () {
										return {
											'attribute': attname,
											'tableName': table.name
										};
									}
								}
							});
							modalInstance.result.then(function (resp) {
								if (resp == "new_table") {
									createTableFromAttribute(tables, attribute, entityReference);
								} else {

									var newTable = entityTableMap.get(entityReference.id);
									ls.selectedElement = ls.paper.findViewByModel(newTable);

									for (var i = 0; i < resp; i++) {
										const column = buildColumn({
											name: attname + i,
											PK: attribute.attributes.type === 'erd.Key',
										});
										ls.addColumn(column);
									}
								}

							});

							iterate();

						} else {
							const column = buildColumn({
								name: attribute.attributes.attrs.text.text,
								PK: attribute.attributes.type === 'erd.Key'
							});
							table.columns.push(column);
							iterate();
						}

					}

				}

				if (attributes.length == 0) {
					resolve(table);
				}

			})();

		});
	}

	const buildTable = (element, neighbors) => {
		return new Promise((resolve) => {
			const name = element.attributes.attrs.text.text;
			const x = element.attributes.position.x;
			const y = element.attributes.position.y;
			const table = createTableObject(name, x, y);
			buildAttributes(table, neighbors, element).then((resp) => resolve(resp));
		});
	}

	const createTableFromAttribute = function (tables, reference, entityReference) {
		var name = reference.attributes.attrs.text.text;

		name = name.replace(/ *\([^)]*\) */g, "");

		var x = reference.attributes.position.x;
		var y = reference.attributes.position.y - 100;

		var table = createTableObject(name, x, y);

		var column = buildColumn({
			name: "nome",
			PK: true,
			type: "VARCHAR",
		});

		table.columns.push(column);
		var newTable = ls.insertTable(table);

		ls.selectedElement = ls.paper.findViewByModel(newTable);

		ls.addColumn(createFKColumn(entityReference));
	}

	const createTableObject = function (name, x, y) {
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

	const getRelationType = (links) => {
		const retationType = {
			'type': "",
			'quantity': 0
		}
		const conections = filterConnections(links);
		conections.forEach(link => {
			if (link.attributes.labels != null) {
				const card = link.attributes.labels[0].attrs.text.text;
				retationType.type = retationType.type + card[4];
				retationType.quantity += 1;
			}
		});
		return retationType;
	}

	const getRelationOptionality = function (links) {
		var optionality = "";
		for (const link of filterConnections(links)) {
			if (link.attributes.labels != null) {
				var card = link.attributes.labels[0].attrs.text.text;
				optionality = optionality + card[1];
			}
		}
		return optionality;
	}

	const isN1Optional = function (links) {
		for (const link of filterConnections(links)) {
			if (link.attributes.labels != null && link.attributes.labels[0].attrs.text.text == '(0, 1)') {
				return true;
			}
		}
		return false;
	}

	const is01Optional = function (links) {
		const connections = filterConnections(links);
		return connections[0].attributes.labels[0].attrs.text.text == '(0, 1)' && connections[1].attributes.labels[0].attrs.text.text == '(0, 1)';
	}

	const buildRelationDescription = function (links) {
		const connections = filterConnections(links);
		return connections[0].attributes.labels[0].attrs.text.text + " < - > " + connections[1].attributes.labels[0].attrs.text.text;
	}

	const getTableNames = function (relation) {
		var tableNames = "(";
		for (const element of modelGraph.getNeighbors(relation)) {
			if (element.attributes.type === 'erd.Entity') {
				tableNames += " " + element.attributes.attrs.text.text;
			}
		}
		tableNames += " )";
		return tableNames;
	}

	const isAutoRelationship = (relation) => {
		var entities = [];
		for (const element of modelGraph.getNeighbors(relation)) {
			if (element.attributes.type === 'erd.Entity') {
				entities.push(element);
			}
		}
		return (entities.length == 1) && entities[0].attributes.autorelationship;
	}

	const getAttributes = (relation) => {
		return modelGraph.getNeighbors(relation)
			.filter(element => element.attributes.type === 'erd.Attribute');
	}

	const getEntityNeighbors = (relation) => {
		return modelGraph.getNeighbors(relation)
			.filter(element => element.attributes.type === 'erd.Entity');
	}

	const getEntityOrRelationNeighbors = (relation) => {
		return modelGraph.getNeighbors(relation)
			.filter(element => element.attributes.type === 'erd.Entity' || element.attributes.type === 'erd.Relationship');
	}

	const getTableType_1 = (links, relation) => {
		var link = links[0];
		var card = link.attributes.labels[0].attrs.text.text;
		if (card != "(1, 1)" && card != "(0, 1)") {
			link = links[1];
		}
		if (link.attributes.source.id != relation.id) {
			return entityTableMap.get(link.attributes.source.id);
		} else {
			return entityTableMap.get(link.attributes.target.id);
		}
	}

	const getTableType_2 = (links, relation) => {
		var link = links[0];
		var card = link.attributes.labels[0].attrs.text.text;
		if (card == "(1, 1)" || card == "(0, 1)") {
			link = links[1];
		}
		if (link.attributes.source.id != relation.id) {
			return entityTableMap.get(link.attributes.source.id);
		} else {
			return entityTableMap.get(link.attributes.target.id);
		}
	}

	const getPKs = (relation) => {
		return modelGraph.getNeighbors(relation)
			.filter(element => element.attributes.type === 'erd.Key');
	}

	const createTableFromRelation = (relation, allPKs) => {
		return new Promise((resolve) => {
			var name = relation.attributes.attrs.text.text;
			var x = relation.attributes.position.x;
			var y = relation.attributes.position.y;

			var table = createTableObject(name, x, y);

			var neighbors = modelGraph.getNeighbors(relation);

			buildAttributes(table, neighbors).then(function (table) {
				var newTable = ls.insertTable(table);

				entityTableMap.set(relation.id, newTable);

				ls.selectedElement = ls.paper.findViewByModel(newTable);
				var hasPrimaryKey = false;

				var entityNeighbors = getEntityNeighbors(relation);
				for (const entity of entityNeighbors) {
					var column = createFKColumn(entity);
					if (!hasPrimaryKey) {
						column.PK = true;
						if (!allPKs) {
							hasPrimaryKey = true;
						}
					}
					ls.addColumn(column);
				}
				resolve();
			});
		});
	}

	const createTableFrom1NRelation = function (relation, links) {
		return new Promise((resolve) => {
			const name = relation.attributes.attrs.text.text;
			const x = relation.attributes.position.x;
			const y = relation.attributes.position.y;

			const table = createTableObject(name, x, y);
			const neighbors = modelGraph.getNeighbors(relation);

			buildAttributes(table, neighbors).then((table) => {
				const newTable = ls.insertTable(table);
				entityTableMap.set(relation.id, newTable);
				ls.selectedElement = ls.paper.findViewByModel(newTable);
				const entityNeighbors = getEntityNeighbors(relation);
				let sideN = {};

				for (const link of filterConnections(links)) {
					if (link.attributes.labels[0].attrs.text.text[4] == 'n') {
						sideN = link;
					}
				}

				for (const entity of entityNeighbors) {
					const column = createFKColumn(entity);
					if ((entity.id == sideN.attributes.source.id) || (entity.id == sideN.attributes.target.id)) {
						column.PK = true;
					}
					ls.addColumn(column);
				}

				resolve();
			});
		});
	}

	const createColumnFromRelation = function (relation, links) {
		return new Promise((resolve) => {
			const attributes = getAttributes(relation);
			const pks = getPKs(relation);
			const table2 = getTableType_2(filterConnections(links), relation);
			ls.selectedElement = ls.paper.findViewByModel(table2);
			const elements = [...attributes, ...pks];
			elements.forEach(element => {
				const column = buildColumn({
					name: element.attributes.attrs.text.text,
					PK: element.attributes.supertype === "Key",
				});
				ls.addColumn(column);
			})
			const table1 = getTableType_1(filterConnections(links), relation);
			entityTableMap.set(relation.id, table1);
			connectTables(table1, table2);
			resolve();
		});
	}

	const treatNNcase = (relation, links) => {
		return new Promise((resolve) => {
			const optionality = getRelationOptionality(links);
			if (optionality == "11" || optionality == "00") {
				createTableFromRelation(relation, true).then(() => resolve());
			} else {
				createTableFromRelation(relation, false).then(() => resolve());
			}
		});
	}

	const treatN1case = function (relation, links) {
		return new Promise((resolve) => {
			if (isN1Optional(links)) {
				const modalInstance = $uibModal.open({
					backdrop: 'static',
					keyboard: false,
					animation: true,
					template: '<conversion-option-modal suggested-name="$ctrl.suggestedName" title="$ctrl.title" options="$ctrl.options" summary="$ctrl.summary" close="$close(result)"></conversion-option-modal>',
					controller: function () {
						const $ctrl = this;
						$ctrl.title = `Assistente de conversão - Relacionamento (1, n)`;
						$ctrl.summary = `O que deseja fazer com o relacionamento ${buildRelationDescription(links)} entre as tabelas ${getTableNames(relation)}?`;
						$ctrl.options = [
							{ "label": "Criar uma coluna na tabela de menor cardinalidade", "value": "new_column" },
							{ "label": "Criar nova tabela", "value": "new_table" },
						]
					},
					controllerAs: '$ctrl',
				});
				modalInstance.result.then((response) => {
					switch (response.value) {
						case "new_table":
							createTableFrom1NRelation(relation, links).then(() => resolve());
							break;
						case "new_column":
							createColumnFromRelation(relation, links).then(() => resolve());
							break;
						default:
							resolve();
							break;
					}
				});
			} else {
				createColumnFromRelation(relation, links).then(() => resolve());
			}
		});
	}

	const treat11case = (relation, links) => {
		return new Promise((resolve) => {
			if (is01Optional(links)) {
				const modalInstance = $uibModal.open({
					backdrop: 'static',
					keyboard: false,
					animation: true,
					template: '<conversion-option-modal suggested-name="$ctrl.suggestedName" title="$ctrl.title" options="$ctrl.options" summary="$ctrl.summary" close="$close(result)"></conversion-option-modal>',
					controller: function () {
						const $ctrl = this;
						$ctrl.title = `Assistente de conversão - Relacionamento (1, 1)`;
						$ctrl.summary = `O que deseja fazer com o relacionamento ${buildRelationDescription(links)} entre as tabelas ${getTableNames(relation)}?`;
						$ctrl.options = [
							{ "label": "Criar uma coluna na tabela de menor cardinalidade", "value": "new_column" },
							{ "label": "Criar nova tabela", "value": "new_table" },
						]
					},
					controllerAs: '$ctrl',
				});
				modalInstance.result.then((response) => {
					switch (response.value) {
						case "new_column":
							createColumnFromRelation(relation, links).then(() => resolve());
							break;
						case "new_table":
							createTableFromRelation(relation, false).then(() => resolve());
							break;
						default:
							break;
					}
				});
			} else {
				if (isAutoRelationship(relation)) {
					createColumnFromRelation(relation, links).then(() => resolve());
				} else {
					const modalInstance = $uibModal.open({
						backdrop: 'static',
						keyboard: false,
						animation: true,
						template: '<conversion-option-modal suggested-name="$ctrl.suggestedName" title="$ctrl.title" options="$ctrl.options" summary="$ctrl.summary" close="$close(result)"></conversion-option-modal>',
						controller: function () {
							const $ctrl = this;
							$ctrl.title = `Assistente de conversão - Relacionamento (1, n)`;
							$ctrl.summary = `O que deseja fazer com o relacionamento ${buildRelationDescription(links)} entre as tabelas ${getTableNames(relation)}?`;
							$ctrl.options = [
								{ "label": "Criar uma coluna na tabela de menor cardinalidade", "value": "new_column" },
								{ "label": "Unir tabelas", "value": "join_tables" }
							]
						},
						controllerAs: '$ctrl',
					});
					modalInstance.result.then((response) => {
						switch (response.value) {
							case "new_column":
								createColumnFromRelation(relation, links).then(() => resolve());
								break;
							case "join_tables":
								joinTablesFromRelation(relation).then(() => resolve());
								break;
							default:
								break;
						}
					});
				}
			}
		});
	}

	const connectTables = function (source, target) {
		const obj = buildColumn({
			name: "id" + source.attributes.name,
			FK: true,
			idOrigin: source.id,
		});
		ls.selectedElement = ls.paper.findViewByModel(target);
		ls.addColumn(obj);
	}

	const joinTablesFromRelation = (relation) => {
		return new Promise((resolve) => {
			const x = relation.attributes.position.x;
			const y = relation.attributes.position.y;
			const neighbors = modelGraph.getNeighbors(relation);
			const entities = getEntityNeighbors(relation);

			entities.forEach(entity => {
				neighbors.push(...modelGraph.getNeighbors(entity));
			})

			const newName = entities.reduce((data, entity) => {
				const entityName = entity.attributes.attrs.text.text;
				if(data === "") {
					return `${entityName}`
				}
				return `${data}_${entityName}`
			}, "")

			const table = createTableObject(newName, x, y);

			buildAttributes(table, neighbors).then((table) => {
				const newTable = ls.insertTable(table);
				entityTableMap.set(relation.id, newTable);
				ls.selectedElement = ls.paper.findViewByModel(newTable);

				entities.forEach(entity => {
					entityTableMap.get(entity.id).remove();
					entityTableMap.set(entity.id, newTable);
				});

				resolve();
			});
		});
	}

	const createFKColumn = function (entity) {
		const pks = getPKs(entity);
		let attName = "id" + entity.attributes.attrs.text.text;
		if (pks.length > 0) {
			attName = pks[0].attributes.attrs.text.text;
		}
		
		return buildColumn({
			name: attName,
			FK: true,
			idOrigin: entityTableMap.get(entity.id).id,
		});
	}

	const filterConnections = function (links) {
		return links.filter(link => {
			if (link.attributes.type == "erd.Line") {
				return true;
			}
			if ((link.attributes.type == "link" || link.attributes.type == "erd.Link") &&
				link.attributes.labels != null &&
				link.attributes.labels[0] != null &&
				link.attributes.labels[0].attrs != null &&
				link.attributes.labels[0].attrs.text != null &&
				link.attributes.labels[0].attrs.text.text != null) {
				const type = link.attributes.labels[0].attrs.text.text;
				return (type == "(0, n)" || type == "(0, 1)" || type == "(1, 1)" || type == "(1, n)");
			}
			return false;
		});
	}

	return {
		toLogic: _toLogic,
		startConversion: _startConversion
	}

};

export default angular
	.module("app.LogicConversorService", [conceptualService, conversionOptionModal])
	.factory("LogicConversorService", logicConversorService).name;
