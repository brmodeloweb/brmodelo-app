angular.module('myapp').factory('ConversorService', function(ConceptualService){

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
					var column = {
						"name": neighbor.attributes.attrs.text.text,
						"PK": false
					}
					table.columns.push(column);
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
