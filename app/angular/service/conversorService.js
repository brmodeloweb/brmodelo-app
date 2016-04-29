angular.module('myapp').factory('ConversorService', function(ConceptualService){

		var modelGraph;
		var cs = ConceptualService;

		_toLogic = function(graph) {
			modelGraph = graph;

			for (element of modelGraph.toJSON().cells) {

				if(element.supertype === 'Entity'){
					console.log(buildTable(element, modelGraph.getNeighbors(element)));
				}

			}
		};

		buildTable = function(element, neighbors){

			var table = {
				"name": '',
				"attrs": [],
				"connectedTo": []
			}

			for (neighbor of neighbors) {
				table.name = element.attrs.text.text;
				if(cs.isAttribute(neighbor)){
					table.attrs.push(neighbor.attributes.attrs.text.text);
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
					connected.push(variable.attributes.attrs.text.text);
				}
			}

		return connected;
		}

	return {
		toLogic : _toLogic,
	}

});