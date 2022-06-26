import angular from "angular";
import conversionOptionModal from "../components/conversionOptionModal";
import conversionAttributeModal from "../components/conversionAttributeModal";
import Validator from "../conceptual/validator";

import Column from "./Column";

const logicConversorService = ($uibModal, $filter) => {

	var modelGraph;
	var ls = {};
	var conversion = {};
	var shapeValidator = new Validator();

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
						template: '<conversion-option-modal title="$ctrl.title" options="$ctrl.options" summary="$ctrl.summary" close="$close(result)"></conversion-option-modal>',
						controller: function () {
							const $ctrl = this;
							$ctrl.title = $filter('translate')("Conversion Assistant - Specialization");
							$ctrl.summary = $filter('translate')("What do you want to do with inheritance from table TABLE_NAME?", { table: getExtensionRootName(extension) });
							$ctrl.options = [
								{ label: $filter('translate')("Use of a table for each entity"), value: "all_tables" },
								{ label: $filter('translate')("Use of a single table for the entire hierarchy"), value: "one_table" },
								{ label: $filter('translate')("Use of a table for specialized entity(ies) only"), value: "children_tables" }
							]
						},
						controllerAs: '$ctrl',
					});
					modalInstance.result.then((response) => {
						switch (response.value) {
							case "all_tables":
								treatExtensionAll(extension).then(() => iterate());
								break;
							case "one_table":
								treatExtensionOneTable(extension).then(() => iterate());
								break;
							case "children_tables":
								treatExtensionChildrensOnly(extension).then(() => iterate());
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

	const treatExtensionOneTable = (extension) => {
		return new Promise((resolve) => {
			joinTablesFromRelation(extension).then(() => resolve());
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
				const modalInstance = $uibModal.open({
					backdrop: 'static',
					keyboard: false,
					animation: true,
					template: '<conversion-option-modal title="$ctrl.title" options="$ctrl.options" summary="$ctrl.summary" close="$close(result)"></conversion-option-modal>',
					controller: function () {
						const $ctrl = this;
						$ctrl.title = $filter('translate')("Attention - Conversion Assistant - Specialization");
						$ctrl.summary = $filter('translate')("It was not possible to perform this conversion because table TABLE_NAME has other connections. Choose another option.", { table: getExtensionRootName(extension) });
						$ctrl.options = [
							{ label: $filter('translate')("Use of a table for each entity"), value: "all_tables" },
							{ label: $filter('translate')("Use of a single table for the entire hierarchy"), value: "one_table" },
						]
					},
					controllerAs: '$ctrl',
				});
				modalInstance.result.then((response) => {
					switch (response.value) {
						case "all_tables":
							treatExtensionAll(extension).then(() => resolve());
							break;
						case "one_table":
							treatExtensionOneTable(extension).then(() => resolve());
							break;
						default:
					}
				});
			} else {
				const rootAttributes = [...getPKs(root), ...getAttributes(root)];
				for (const children of childrens) {
					for (const attribute of rootAttributes) {
						const column = new Column({
							name: attribute.attributes.attrs.text.text,
							PK: attribute.attributes.type === 'erd.Key',
						});
						ls.selectedElement = ls.paper.findViewByModel(entityTableMap.get(children.id));
						ls.addColumn(column);
					}
				}
				entityTableMap.get(root.id).remove();
				resolve();
			}
		});
	}

	const treatExtensionAll = (extension) => {
		return new Promise((resolve) => {
			const neighbors = getEntityNeighbors(extension);
			const childrens = neighbors.filter(neighbor => extension.attributes.parentId != neighbor.id);
			const root = neighbors.find(neighbor => extension.attributes.parentId == neighbor.id);
			childrens.forEach(children => connectTables(entityTableMap.get(root.id), entityTableMap.get(children.id)));
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
							const column = new Column({
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
		const parents = new Map();
		const attributes = neighbors.filter(neighbor => neighbor.attributes.type === 'erd.Attribute'|| neighbor.attributes.type === 'erd.Key');
		return new Promise((resolve) => {
			(function iterate() {
				const attribute = attributes.shift();
				if (attribute != null) {
					if (attribute.attributes.composed) {
						parents.set(attribute.id, attribute);
						const filhos = modelGraph.getNeighbors(attribute);
						filhos.forEach(filho => {
							if (shapeValidator.isAttribute(filho) && parents.get(filho.id) == null) {
								attributes.push(filho);
							}
						});
						iterate();
					} else {
						const cardinality = attribute.attributes.cardinality;
						const attName = attribute.attributes.attrs.text.text.replace(/ *\([^)]*\) */g, "");
						if (cardinality == "(0, n)" || cardinality == "(1, n)") {
							const modalInstance = $uibModal.open({
								backdrop: 'static',
								keyboard: false,
								animation: true,
								template: '<conversion-attribute-modal title="$ctrl.title" options="$ctrl.options" summary="$ctrl.summary" close="$close(result)"></conversion-attribute-modal>',
								controller: function () {
									const $ctrl = this;
									$ctrl.title = $filter('translate')("Conversion Assistant: Multivalued Attribute");
									$ctrl.summary = $filter('translate')("What do you want to do with multivalued attribute ATTR_NAME of table TABLE_NAME?", { attribute: attName, table: table.name });
									$ctrl.options = [
										{ label: $filter('translate')("Use of a table for each entity"), value: "all_tables" },
										{ label: $filter('translate')("Use of a single table for the entire hierarchy"), value: "one_table" },
									]
								},
								controllerAs: '$ctrl',
							});
							modalInstance.result.then((response) => {
								switch (response.value) {
									case "new_table":
										createTableFromAttribute(tables, attribute, entityReference);
										break;
									case "new_column":
										const newTable = entityTableMap.get(entityReference.id);
										ls.selectedElement = ls.paper.findViewByModel(newTable);
										[...Array(response.quantity)].forEach((_, index) => {
											const column = new Column({
												name: `${attName}${index}`,
												PK: attribute.attributes.type === 'erd.Key',
											})
											ls.addColumn(column);
										});
										break;
									default:
										break;
								}
							});
							iterate();
						} else {
							const column = new Column({
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

	const createTableFromAttribute = (tables, reference, entityReference) => {
		const name = reference.attributes.attrs.text.text.replace(/ *\([^)]*\) */g, "");
		const x = reference.attributes.position.x;
		const y = reference.attributes.position.y - 100;
		const table = createTableObject(name, x, y);

		const column = new Column({
			name: "nome",
			PK: true,
			type: "VARCHAR",
		});

		table.columns.push(column);
		const newTable = ls.insertTable(table);
		ls.selectedElement = ls.paper.findViewByModel(newTable);
		ls.addColumn(createFKColumn(entityReference));
	}

	const createTableObject = (name, x, y) => {
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

	const getRelationOptionality = (links) => {
		var optionality = "";
		for (const link of filterConnections(links)) {
			if (link.attributes.labels != null) {
				var card = link.attributes.labels[0].attrs.text.text;
				optionality = optionality + card[1];
			}
		}
		return optionality;
	}

	const isN1Optional = (links) => {
		for (const link of filterConnections(links)) {
			if (link.attributes.labels != null && link.attributes.labels[0].attrs.text.text == '(0, 1)') {
				return true;
			}
		}
		return false;
	}

	const is01Optional = (links) => {
		const connections = filterConnections(links);
		return connections[0].attributes.labels[0].attrs.text.text == '(0, 1)' && connections[1].attributes.labels[0].attrs.text.text == '(0, 1)';
	}

	const buildRelationDescription = (links) => {
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

	const createTableFrom1NRelation = (relation, links) => {
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

	const createColumnFromRelation = (relation, links) => {
		return new Promise((resolve) => {
			const attributes = getAttributes(relation);
			const pks = getPKs(relation);
			const table2 = getTableType_2(filterConnections(links), relation);
			ls.selectedElement = ls.paper.findViewByModel(table2);
			const elements = [...attributes, ...pks];
			elements.forEach(element => {
				const column = new Column({
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

	const treatN1case = (relation, links) => {
		return new Promise((resolve) => {
			if (isN1Optional(links)) {
				const modalInstance = $uibModal.open({
					backdrop: 'static',
					keyboard: false,
					animation: true,
					template: '<conversion-option-modal title="$ctrl.title" options="$ctrl.options" summary="$ctrl.summary" close="$close(result)"></conversion-option-modal>',
					controller: function () {
						const $ctrl = this;
						$ctrl.title = $filter('translate')("Conversion Assistant - Relationship (1, n)");
						$ctrl.summary = $filter('translate')("What do you want to do with the RELATIONSHIP relationship between the TABLES tables?", { relationship: buildRelationDescription(links), tables: getTableNames(relation) });
						$ctrl.options = [
							{ label: $filter('translate')("Create a column in the least cardinality table"), value: "new_column" },
							{ label: $filter('translate')("Create new table"), value: "new_table" },
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
					template: '<conversion-option-modal title="$ctrl.title" options="$ctrl.options" summary="$ctrl.summary" close="$close(result)"></conversion-option-modal>',
					controller: function () {
						const $ctrl = this;
						$ctrl.title = $filter('translate')("Conversion Assistant - Relationship (1, 1)");
						$ctrl.summary = $filter('translate')("What do you want to do with the RELATIONSHIP relationship between the TABLES tables?", { relationship: buildRelationDescription(links), tables: getTableNames(relation) });
						$ctrl.options = [
							{ label: $filter('translate')("Create a column in the least cardinality table"), value: "new_column" },
							{ label: $filter('translate')("Create new table"), value: "new_table" },
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
						template: '<conversion-option-modal title="$ctrl.title" options="$ctrl.options" summary="$ctrl.summary" close="$close(result)"></conversion-option-modal>',
						controller: function () {
							const $ctrl = this;
							$ctrl.title = $filter('translate')("Conversion Assistant - Relationship (1, n)");
							$ctrl.summary = $filter('translate')("What do you want to do with the RELATIONSHIP relationship between the TABLES tables?", { relationship: buildRelationDescription(links), tables: getTableNames(relation) });
							$ctrl.options = [
								{ label: $filter('translate')("Create a column in the least cardinality table"), value: "new_column" },
								{ label: $filter('translate')("Join tables"), value: "join_tables" }
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

	const connectTables = (source, target) => {
		const column = new Column({
			name: "id" + source.attributes.name,
			FK: true,
			idOrigin: source.id,
		});
		ls.selectedElement = ls.paper.findViewByModel(target);
		ls.addColumn(column);
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

	const createFKColumn = (entity) => {
		const pks = getPKs(entity);
		let attName = "id" + entity.attributes.attrs.text.text;
		if (pks.length > 0) {
			attName = pks[0].attributes.attrs.text.text;
		}
		
		return new Column({
			name: attName,
			FK: true,
			idOrigin: entityTableMap.get(entity.id).id,
		});
	}

	const filterConnections = (links) => {
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
	.module("app.LogicConversorService", [conversionOptionModal, conversionAttributeModal])
	.factory("LogicConversorService", logicConversorService).name;
