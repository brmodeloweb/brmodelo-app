import "backbone";
import $ from "jquery";

import * as joint from "jointjs/dist/joint";
import jointCss from "jointjs/dist/joint.min.css";

import "../../joint/joint.ui.stencil";
import "../../joint/joint.ui.stencil.css";
import "../../joint/joint.ui.selectionView";
import "../../joint/joint.ui.selectionView.css";
import "../../joint/joint.ui.halo.css";
import "../../joint/joint.ui.halo";
import "../../joint/br-scroller";
import "../../joint/joint.dia.command";
import shapes from "../../joint/shapes";
joint.shapes.erd = shapes;

/*
 * This line prevent a sideEffect issue in jointjs library. 
 * This sideEffect config make webpack ignore joint css imports
 * See more: https://github.com/webpack/webpack/issues/8814
 */
console.log(jointCss)

import angular from "angular";
import template from "./conceptual.html";

import modelDuplicatorComponent from "../components/duplicateModelModal";

import Factory from "./factory";
import Validator from "./validator";
import Linker from "./linker";
import EntityExtensor from "./entityExtensor";

const controller = function (ModelAPI, $stateParams, $rootScope, $timeout, $uibModal, $state) {
	const ctrl = this;
	ctrl.feedback = {
		message: "",
		showing: false
	}
	ctrl.loading = true;
	ctrl.model = {
		id: '',
		name: '',
		type: 'conceptual',
		model: '',
		user: $rootScope.loggeduser
	}
	ctrl.selectedElement = {};
	const configs = {
		graph: {},
		paper: {},
		paperScroller: {},
		commandManager: {},
	};

	ctrl.setLoading = (show) => {
		$timeout(() => {
			ctrl.loading = show;
		});
	}

	ctrl.showFeedback = (show, newMessage) => {
		$timeout(() => {
			ctrl.feedback.showing = show;
			ctrl.feedback.message = newMessage;
		});
	}

	ctrl.saveModel = () => {
		ctrl.setLoading(true);
		ctrl.model.model = JSON.stringify(configs.graph);
		ModelAPI.updateModel(ctrl.model).then(function (res) {
			ctrl.showFeedback(true, "Salvo com sucesso!");
			ctrl.setLoading(false);
		});
	}

	ctrl.print = () => {
		window.print();
	}

	ctrl.undoModel = () => {
		configs.commandManager.undo();
	}

	ctrl.redoModel = () => {
		configs.commandManager.redo();
	}

	ctrl.zoomIn = () => {
		configs.paperScroller.zoom(0.2, { max: 2 });
	}

	ctrl.zoomOut = () => {
		configs.paperScroller.zoom(-0.2, { min: 0.2 });
	}

	ctrl.duplicateModel = (model) => {
		const modalInstance = $uibModal.open({
			animation: true,
			template: '<duplicate-model-modal suggested-name="$ctrl.suggestedName" close="$close(result)" dismiss="$dismiss(reason)"></duplicate-model-modal>',
			controller: function () {
				const $ctrl = this;
				$ctrl.suggestedName = `${model.name} (cópia)`;
			},
			controllerAs: '$ctrl',
		});
		modalInstance.result.then((newName) => {
			ctrl.setLoading(true);
			const duplicatedModel = {
				id: "",
				name: newName,
				type: model.type,
				model: model.model,
				user: model.who,
			};
			ModelAPI.saveModel(duplicatedModel).then((newModel) => {
				window.open($state.href('conceptual', { 'modelid': newModel._id }));
				ctrl.showFeedback(true, "Duplicado com sucesso!");
				ctrl.setLoading(false);
			});
		});
	};

	ctrl.convertModel = (conceptualModel) => {
		const model = {
			"name": conceptualModel.name + "_convertido",
			"user": $rootScope.loggeduser,
			"type": "logic",
			"model": '{"cells":[]}'
		};
		ModelAPI.saveModel(model)
			.then((newModel) => {
				window.open($state.href('logic', { references: { 'modelid': newModel._id, 'conversionId': conceptualModel._id } }), '_blank');
			});
	}

	ctrl.onSelectElement = (cellView) => {
		if (cellView != null) {
			$timeout(() => {
				ctrl.selectedElement = {
					value: cellView.model.attributes?.attrs?.text?.text,
					type: cellView.model.attributes.supertype,
					element: cellView
				}
			});
			return
		}

		$timeout(() => {
			ctrl.selectedElement = {
				value: "",
				type: "blank",
				element: null
			}
		});
	}

	ctrl.onUpdate = (event) => {
		switch (event.type) {
			case 'name':
				$timeout(() => {
					ctrl.selectedElement.element.model.attributes.attrs.text.text = event.value;
					ctrl.selectedElement.element.update();
				});
				break;
			case 'extention':
				$timeout(() => {
					if (ctrl.selectedElement.element.model.attributes.isExtended) {
						ctrl.entityExtensor.updateExtension(ctrl.selectedElement.element, event.value);
						ctrl.selectedElement.element.update();
					} else {
						ctrl.entityExtensor.createExtension(ctrl.selectedElement.element, event.value);
					}
				});
				break;
			case 'editExtention':
				$timeout(() => {
					ctrl.selectedElement.element.model.attributes.attrs.text.text = event.value;
					ctrl.selectedElement.element.update();
				});
				break;
			case 'addAutoRelationship':
				$timeout(() => {
					ctrl.shapeLinker.addAutoRelationship(ctrl.selectedElement);
				});
				break;
			case 'link.cardinality':
				$timeout(() => {
					ctrl.selectedElement.element.model.label(0,
						{
							position: 0.3,
							attrs: { text: { text: event.value } }
						});
				});
				break;
			case 'link.role':
				$timeout(() => {
					ctrl.selectedElement.element.model.label(1,
						{
							position: 0.7,
							attrs: { text: { text: event.value } }
						});
				});
				break;
			case 'link.weak':
				$timeout(() => {
					if (event.value) {
						ctrl.selectedElement.element.model.attributes.attrs = {
							'.connection': { stroke: 'black', 'stroke-width': 3 }
						};
					} else {
						ctrl.selectedElement.element.model.attributes.attrs = {
							'.connection': { stroke: 'black', 'stroke-width': 1 }
						};
					}
					ctrl.selectedElement.element.model.attributes.weak = event.value;
					ctrl.selectedElement.element.update();
				});
				break;
			case 'attribute.cardinality':
				$timeout(() => {
					const newCardinality = event.value;
					let currentText = ctrl.selectedElement.value.name;

					if(newCardinality != '(1, 1)'){
						currentText = currentText + " " + newCardinality;
					}

					ctrl.selectedElement.element.model.attributes.attrs.text.text = currentText;
					ctrl.selectedElement.element.model.attributes.cardinality = newCardinality;
					ctrl.selectedElement.element.update();
				});
				break;
			case 'attribute.name':
				$timeout(() => {
					let newName = event.value;
					const currentCardinality = ctrl.selectedElement.value.cardinality;

					if(currentCardinality != '(1, 1)'){
						newName = newName + " " + currentCardinality;
					}

					ctrl.selectedElement.element.model.attributes.attrs.text.text = newName;
					ctrl.selectedElement.element.update();
				});
				break;
			case 'attribute.composed':
				$timeout(() => {
					const newValue = event.value;
					const root = ctrl.selectedElement.element.model;
					if(newValue) {
							const rootX = root.attributes.position.x;
							const rootY = root.attributes.position.y;

							const attr1 = ctrl.shapeFactory.createAttribute({ "position": { x: rootX + 50, y: rootY + 20 }});
							attr1.attributes.attrs.text.text = "attr1";

							configs.graph.addCell(attr1);
							ctrl.shapeLinker.createLink(root, attr1, configs.graph);

							const attr2 = ctrl.shapeFactory.createAttribute({ "position": { x: rootX + 50, y: rootY - 20 }});
							attr2.attributes.attrs.text.text = "attr2";

							configs.graph.addCell(attr2);
							ctrl.shapeLinker.createLink(root, attr2, configs.graph);
					} else {
						configs.graph.getNeighbors(root)
							.filter(neighbor => ctrl.shapeValidator.isAttribute(neighbor))
							.forEach(neighbor => neighbor.remove());
					}
				});
				break;
			case 'relationship.associative':
				$timeout(() => {
					const relationship = ctrl.selectedElement.element.model;
					if(relationship.attributes.parent == null){
						const posX = relationship.attributes.position.x;
						const posY = relationship.attributes.position.y;
						const block = ctrl.shapeFactory.createBlockAssociative({ "position": { x: posX - 6, y: posY - 2 }});

						configs.graph.addCell(block);

						block.embed(relationship);
						relationship.toFront();
					}
				});
				break;
		}
	}

	ctrl.makeAssociative = (model) => {
		const posX = model.attributes.position.x;
		const posY = model.attributes.position.y;
		const block = ctrl.shapeFactory.createBlockAssociative({ "position": { x: posX, y: posY }});
		const auto = ctrl.shapeFactory.createRelationship({ position: { x: posX + 6, y: posY + 2 }});

		block.embed(auto);
		configs.graph.addCells([block, auto]);

		$timeout(() => {
			model.remove();
		})
	}

	ctrl.makeComposedAttribute = (model) => {
		$timeout(() => {
			const posX = model.attributes.position.x;
			const posY = model.attributes.position.y;
			const base = ctrl.shapeFactory.createAttribute({ "position": { x: posX, y: posY }});
			base.attributes.composed = true;

			const attr1 = ctrl.shapeFactory.createAttribute({ "position": { x: posX + 50, y: posY + 20 }});
			attr1.attributes.attrs.text.text = "attr1";

			const attr2 = ctrl.shapeFactory.createAttribute({ "position": { x: posX + 50, y: posY - 20 }});
			attr2.attributes.attrs.text.text = "attr2";

			configs.graph.addCells([base, attr1, attr2]);
			ctrl.shapeLinker.createLink(base, attr1, configs.graph);
			ctrl.shapeLinker.createLink(base, attr2, configs.graph);
			model.remove();
		}, 100)
	}

	const registerPaperEvents = (paper) => {
		paper.on('blank:pointerdown', function (evt, x, y) {
			ctrl.showFeedback(false, "");
			configs.selectionView.startSelecting(evt);
			ctrl.onSelectElement(null);
		});

		paper.on('link:options', (cellView) => {
			ctrl.onSelectElement(cellView);
		});

		paper.on('element:pointerup', (cellView, evt, x, y) => {
			ctrl.onSelectElement(cellView);
			// if(x != null && y != null){
			// 	$scope.conectElements(cellView, x, y)
			// }
			configs.selectionView.cancelSelection();

			const halo = new joint.ui.Halo({
				cellView: cellView,
				boxContent: false
			});

			halo.on('action:link:add', function (link) {
				ctrl.shapeLinker.onLink(link);
			});

			if (ctrl.shapeValidator.isAttribute(cellView.model) || ctrl.shapeValidator.isExtension(cellView.model)) {
				halo.removeHandle('resize');
			}

			halo.removeHandle('clone');
			halo.removeHandle('fork');
			halo.removeHandle('rotate');
			halo.render();
		});
	}

	const registerGraphEvents = (graph) => {
		graph.on('change:position', function (cell) {
			const parentId = cell.get('parent');
			if (!parentId) return;
			const parent = configs.graph.getCell(parentId);
			const parentBbox = parent.getBBox();
			const cellBbox = cell.getBBox();
			if (parentBbox.containsPoint(cellBbox.origin()) &&
				parentBbox.containsPoint(cellBbox.topRight()) &&
				parentBbox.containsPoint(cellBbox.corner()) &&
				parentBbox.containsPoint(cellBbox.bottomLeft())) {
					return;
				}
			cell.set('position', cell.previous('position'));
		});

		graph.on('add', (model) => {
			if (model instanceof joint.dia.Link) return;

			if(ctrl.shapeValidator.isAssociative(model)) {
				ctrl.makeAssociative(model);
			}

			if(ctrl.shapeValidator.isComposedAttribute(model)) {
				ctrl.makeComposedAttribute(model);
			}

			// 	if(cs.isComposedAttribute(cellView.model)) {

			// 		var x = cellView.model.attributes.position.x;
			// 		var y = cellView.model.attributes.position.y;
			// 		cellView.model.remove();

			// 		$timeout(function(){


			// 		}, 100);

			// 	}

			// 	if(cellView != null && (cs.isAttribute(cell) || cs.isKey(cell))){
			// 		var x = cellView.model.attributes.position.x;
			// 		var y = cellView.model.attributes.position.y;
			// 		if(x != null && y != null){
			// 			$scope.conectElements(cellView, x, y);
			// 		}
			// 	}
		});

	}

	const buildWorkspace = () => {
		configs.graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });

		registerGraphEvents(configs.graph);

		configs.commandManager = new joint.dia.CommandManager({ graph: configs.graph })

		const content = $("#content");

		configs.paper = new joint.dia.Paper({
			width: content.width(),
			height: content.height(),
			gridSize: 10,
			drawGrid: true,
			model: configs.graph,
			linkConnectionPoint: joint.util.shapePerimeterConnectionPoint,
			cellViewNamespace: joint.shapes
		});

		registerPaperEvents(configs.paper);

		configs.selectionView = new joint.ui.SelectionView({ paper: configs.paper, graph: configs.graph, model: new Backbone.Collection });

		configs.paperScroller = new joint.ui.PaperScroller({
			paper: configs.paper,
			cursor: "grab",
			autoResizePaper: true,
		});

		content.append(configs.paperScroller.render().el);

		const stencil = new joint.ui.Stencil({
			graph: configs.graph,
			paper: configs.paper,
		});

		$("#stencil-holder").append(stencil.render().el);

		stencil.load([
			ctrl.shapeFactory.createEntity({ position: { x: 25, y: 10 } }),
			ctrl.shapeFactory.createIsa({ position: { x: 40, y: 70 } }),
			ctrl.shapeFactory.createRelationship({ position: { x: 25, y: 130 } }),
			ctrl.shapeFactory.createAssociative({ position: { x: 15, y: 185 } }),
			ctrl.shapeFactory.createAttribute({ position: { x: 65, y: 265 } }),
			ctrl.shapeFactory.createKey({ position: { x: 65, y: 305 } }),
			ctrl.shapeFactory.createComposedAttribute({ position: { x: 30, y: 345 } }),
		]);
	};

	ctrl.$postLink = () => {
		buildWorkspace();
	};

	ctrl.$onInit = () => {
		ctrl.shapeFactory = new Factory(joint.shapes);
		ctrl.shapeValidator = new Validator();
		ctrl.shapeLinker = new Linker(ctrl.shapeFactory, ctrl.shapeValidator);
		ctrl.entityExtensor = new EntityExtensor(ctrl.shapeFactory, ctrl.shapeValidator, ctrl.shapeLinker);
		ctrl.setLoading(true);
		ModelAPI.getModel($stateParams.modelid, $rootScope.loggeduser).then((resp) => {
			const jsonModel = (typeof resp.data.model == "string") ? JSON.parse(resp.data.model) : resp.data.model;
			ctrl.model = resp.data;
			ctrl.model.id = resp.data._id;
			ctrl.model.model = jsonModel;
			configs.graph.fromJSON(jsonModel);
			ctrl.setLoading(false);
		});
	}

};

export default angular
	.module("app.workspace.conceptual", [modelDuplicatorComponent])
	.component("editorConceptual", {
		template,
		controller,
	}).name;
