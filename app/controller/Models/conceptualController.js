angular.module('myapp').controller("conceptualController", ['$scope', '$http', function($scope, $http) {

	$scope.editionVisible = false;

	$scope.changeVisible = function(){
		$scope.editionVisible = !$scope.editionVisible;
	}

	$(document).ready(function() {

		var graph = new joint.dia.Graph;
		var paper = new joint.dia.Paper({
			el: $('#content'),
			width: $('#content').width(),
			height: $('#content').height(),
			gridSize: 1,
			model: graph,
			linkPinning: false,
			markAvailable: true,
			restrictTranslate: true,
			linkConnectionPoint: joint.util.shapePerimeterConnectionPoint,
		});

		paper.on('cell:pointerup', function(cellView) {
			// We don't want a Halo for links.
			if (cellView.model instanceof joint.dia.Link) return;
			// var halo = new joint.ui.Halo({ graph: graph, paper: paper, cellView: cellView });
			// new teste
			// var halo = new joint.ui.Halo({cellView: cellView });
			// halo.render();
			// var freetransform = new joint.ui.FreeTransform({ cellView: cellView, allowRotation: false });
			var halo = new joint.ui.Halo({
				cellView: cellView,
				boxContent: false
			});
				halo.removeHandle('resize');
				halo.removeHandle('clone');
				halo.removeHandle('fork');
				halo.removeHandle('rotate');
				// halo.removeHandle('remove');
		//	halo.changeHandle('clone', {
		//		position: 'se'
		//	});
			halo.render();
		});

		var stencil = new joint.ui.Stencil({
			graph: graph,
			paper: paper
		});
		$('#stencil-holder').append(stencil.render().el);

		var entity = new joint.shapes.erd.Entity({
			position: {
				x: 10,
				y: 10
			},
			size: {
				width: 80,
				height: 40
			}
		});

		var attribute = new joint.shapes.erd.Normal({
			position: {
				x: 100,
				y: 10
			},
			size: {
				width: 80,
				height: 40
			}
		});

		var isa = new joint.shapes.erd.ISA({
			position: {
				x: 10,
				y: 70
			},
			size: {
				width: 80,
				height: 40
			}
		});

		var key = new joint.shapes.erd.Key({
			position: {
				x: 100,
				y: 70
			},
			size: {
				width: 80,
				height: 40
			}
		});

		var relationship = new joint.shapes.erd.Relationship({
			position: {
				x: 10,
				y: 130
			},
			size: {
				width: 80,
				height: 40
			}
		});

		var multivalued = new joint.shapes.erd.Multivalued({
			position: {
				x: 100,
				y: 130
			},
			size: {
				width: 80,
				height: 40
			}
		});

		var weakEntity = new joint.shapes.erd.WeakEntity({
			position: {
				x: 10,
				y: 190
			},
			size: {
				width: 80,
				height: 40
			}
		});

		var devived = new joint.shapes.erd.Derived({
			position: {
				x: 100,
				y: 190
			},
			size: {
				width: 80,
				height: 40
			}
		});

		var identifyingRelationship = new joint.shapes.erd.IdentifyingRelationship({
			position: {
				x: 10,
				y: 250
			},
			size: {
				width: 80,
				height: 40
			}
		});

		stencil.load([entity, attribute, isa, key, relationship,
			multivalued, devived, weakEntity, identifyingRelationship
		]);

		var erd = joint.shapes.erd;

		var element = function(elm, x, y, label) {
			var cell = new elm({
				position: {
					x: x,
					y: y
				},
				attrs: {
					text: {
						text: label
					}
				}
			});
			graph.addCell(cell);
			return cell;
		};

		//    var employee = element(erd.Entity, 100, 200, "Employee");

	});

}]);




app.$inject = ['$scope', '$http', '$cookies'];