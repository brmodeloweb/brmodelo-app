angular.module('myapp').factory('ConversorService', function(ConceptualService, $uibModal){

		var modelGraph;
		var cs = ConceptualService;
		var conversion = {};

		_startConversion = function(){
			_toLogic(conversion);
		}

		_toLogic = function(graph) {
			modelGraph = graph;
			conversion = graph;

			var tables = [];

			for (element of modelGraph.toJSON().cells) {

				if(element.type === 'erd.Entity'){
					tables.push(buildTable(element, modelGraph.getNeighbors(element)));
				}

			}

			return tables;
		};

		buildAttributes = function(attribute, table, parents) {
			if(attribute.attributes.composed) {
				parents.set(attribute.id, attribute);
				var filhos = modelGraph.getNeighbors(attribute);
				for (filho of filhos){
					if(cs.isAttribute(filho) && parents.get(filho.id) == null) {
						buildAttributes(filho, table, parents);
					}
				}
			} else {
				var cardinality = attribute.attributes.cardinality;

					if(cardinality == "(0, n)" || cardinality == "(1, n)") {
						var modalInstance = $uibModal.open({
							animation: true,
							templateUrl: 'angular/view/modal/conversions/attributeConversionModal.html',
							controller:  'AttributeModalController'
						});

						modalInstance.result.then(function (model) {
							console.log("Result", model);
							for (var i = 0; i < 2; i++) {
								var name = attribute.attributes.attrs.text.text.replace(/ *\([^)]*\) */g, "");
								console.log(name);
								var pi = {
									"name": name + i,
									"PK": false
								}
								console.log(pi);
								table.columns.push(pi);
								console.log(table);
							}
						});

					} else {
					var column = {
						"name": attribute.attributes.attrs.text.text,
						"PK": false
					}
					table.columns.push(column);
				}

			}
		}

		buildTable = function(element, neighbors) {

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

			for (neighbor of neighbors) {

				if(cs.isAttribute(neighbor)){
					buildAttributes(neighbor, table, new Map());
				}

				if(cs.isKey(neighbor)){
					var key = {
						"name": neighbor.attributes.attrs.text.text,
						"PK": true
					}
					table.columns.push(key);
				}

				if(cs.isRelationship(neighbor)){
					table.connectedTo.push(getConnectedTo(element, neighbor));
				}

			}

			return table;
		}

		getConnectedTo = function(elmself, relation){
			var connected = [];

			for (variable of modelGraph.getNeighbors(relation)) {
				if (variable.attributes.id != elmself.id && variable != relation) {
				//	connected.push(variable.attributes.attrs.text.text);
				}
			}

		return connected;
		}

	return {
		toLogic : _toLogic,
		startConversion : _startConversion
	}

});
