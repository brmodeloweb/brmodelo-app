import "backbone";
import $ from "jquery";

import * as joint from "jointjs/dist/joint";

import "../editor/editorManager";
import "../editor/editorScroller";
import "../editor/editorActions";
import "../editor/elementActions";

import shapes from "../../joint/shapes";
joint.shapes.erd = shapes;

import angular from "angular";
import template from "./conceptual.html";

import modelDuplicatorComponent from "../components/duplicateModelModal";
import statusBar from "../components/statusBar";
import bugReportButton from "../components/bugReportButton";

import Factory from "./factory";
import Validator from "./validator";
import Linker from "./linker";
import EntityExtensor from "./entityExtensor";
import KeyboardController, { types } from "../components/keyboardController";
import ToolsViewService from "../service/toolsViewService";
import preventExitServiceModule from "../service/preventExitService";

const controller = function (ModelAPI, $stateParams, $rootScope, $timeout, $uibModal, $state, $transitions, preventExitService, $filter) {
	const ctrl = this;
	ctrl.modelState = {
		isDirty: false,
		updatedAt: new Date(),
	};
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
	ctrl.selectedElementActions = {};
	const configs = {
		graph: {},
		paper: {},
		editorActions: {},
		keyboardController: null,
	};

	const setIsDirty = (isDirty) => {
		ctrl.modelState.isDirty = isDirty;
	};

	ctrl.setLoading = (show) => {
		$timeout(() => {
			ctrl.loading = show;
		});
	}

	ctrl.showFeedback = (show, newMessage) => {
		$timeout(() => {
			ctrl.feedback.showing = show;
			ctrl.feedback.message = $filter('translate')(newMessage);
		});
	}

	ctrl.saveModel = () => {
		ctrl.modelState.updatedAt = new Date();
		setIsDirty(false);
		ctrl.setLoading(true);
		ctrl.model.model = JSON.stringify(configs.graph);
		ModelAPI.updateModel(ctrl.model).then(function (res) {
			ctrl.showFeedback(true, "Saved successfully!");
			ctrl.setLoading(false);
		});
	}

	ctrl.print = () => {
		window.print();
	}

	ctrl.undoModel = () => {
		configs.editorActions.undo();
	}

	ctrl.redoModel = () => {
		configs.editorActions.redo();
	}

	ctrl.zoomIn = () => {
		configs.editorScroller.zoom(0.1, { max: 2 });
	}

	ctrl.zoomOut = () => {
		configs.editorScroller.zoom(-0.1, { min: 0.2 });
	}

	ctrl.zoomNone = () => {
		configs.editorScroller.zoom();
	}

	ctrl.duplicateModel = (model) => {
		const modalInstance = $uibModal.open({
			animation: true,
			template: '<duplicate-model-modal suggested-name="$ctrl.suggestedName" close="$close(result)" dismiss="$dismiss(reason)"></duplicate-model-modal>',
			controller: function () {
				const $ctrl = this;
				$ctrl.suggestedName = $filter('translate')('MODEL_NAME (copy)', { name: model.name });
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
				ctrl.showFeedback(true, "Successfully duplicated!");
				ctrl.setLoading(false);
			});
		});
	};

	ctrl.convertModel = (conceptualModel) => {
		const model = {
			"name": conceptualModel.name + $filter('translate')("_converted"),
			"user": $rootScope.loggeduser,
			"type": "logic",
			"model": '{"cells":[]}'
		};
		ModelAPI.saveModel(model)
			.then((newModel) => {
				window.open($state.href('logic', { references: { 'modelid': newModel._id, 'conversionId': conceptualModel._id } }), '_blank');
			});
	}

	ctrl.unselectAll = () => {
		ctrl.showFeedback(false, "");
		ctrl.onSelectElement(null);
		if(configs.selectedElementActions) {
			configs.selectedElementActions.remove();
			configs.selectedElementActions = null;
		}
	}

	ctrl.onSelectElement = (cellView) => {
		if (cellView != null) {
			$timeout(() => {
				const elementType = cellView.model.isLink() ? "Link" : cellView.model.attributes.supertype;
				ctrl.selectedElement = {
					value: cellView.model.attributes?.attrs?.text?.text,
					type: elementType,
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
		paper.on('blank:pointerdown', (evt) => {
			ctrl.unselectAll();
			if(!configs.keyboardController.spacePressed){

			} else {
				configs.editorScroller.startPanning(evt);
			}
		});

		paper.on('link:options', (cellView) => {
			ctrl.onSelectElement(cellView);
		});

		paper.on('element:pointerup', (cellView, evt, x, y) => {
			ctrl.onSelectElement(cellView);

			const elementActions = new joint.ui.ElementActions({
				cellView: cellView,
				boxContent: false
			});

			configs.selectedElementActions = elementActions;
			elementActions.on('action:link:add', function (link) {
				ctrl.shapeLinker.onLink(link);
			});

			if (ctrl.shapeValidator.isAttribute(cellView.model) || ctrl.shapeValidator.isExtension(cellView.model)) {
				elementActions.removeHandle('resize');
			}

			elementActions.removeHandle('clone');
			elementActions.removeHandle('fork');
			elementActions.removeHandle('rotate');
			elementActions.render();
		});

		configs.paper.on('link:mouseenter', (linkView) => {
			const conectionType = ctrl.shapeLinker.getConnectionTypeFromLink(linkView.model);
			const toolsView = ctrl.toolsViewService.getToolsView(conectionType);
			linkView.addTools(toolsView);
		});

		configs.paper.on('link:mouseleave', (linkView) => {
			linkView.removeTools();
		});
	}

	const registerShortcuts = () => {
		configs.keyboardController.registerHandler(types.SAVE, () => ctrl.saveModel());
		configs.keyboardController.registerHandler(types.UNDO, () => ctrl.undoModel());
		configs.keyboardController.registerHandler(types.REDO, () => ctrl.redoModel());
		configs.keyboardController.registerHandler(types.ZOOM_IN, () => ctrl.zoomIn());
		configs.keyboardController.registerHandler(types.ZOOM_OUT, () => ctrl.zoomOut());
		configs.keyboardController.registerHandler(types.ZOOM_NONE, () => ctrl.zoomNone());
		configs.keyboardController.registerHandler(types.ESC, () => ctrl.unselectAll());
	}

	const registerGraphEvents = (graph) => {

		graph.on("change", () => {
			setIsDirty(true);
		});

		graph.on("remove", () => {
			setIsDirty(true);
		});

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
			setIsDirty(true);
			if (model instanceof joint.dia.Link) return;

			if(ctrl.shapeValidator.isAssociative(model)) {
				ctrl.makeAssociative(model);
			}

			if(ctrl.shapeValidator.isComposedAttribute(model)) {
				ctrl.makeComposedAttribute(model);
			}

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

		configs.keyboardController = new KeyboardController(configs.paper.$document);

		registerPaperEvents(configs.paper);

		configs.editorScroller = new joint.ui.EditorScroller({
			paper: configs.paper,
			cursor: "grabbing",
			autoResizePaper: true,
		});
		content.append(configs.editorScroller.render().el);

		const enditorManager = new joint.ui.EditorManager({
			graph: configs.graph,
			paper: configs.paper,
		});

		configs.editorActions = new joint.dia.EditorActions({ graph: configs.graph });

		$(".elements-holder").append(enditorManager.render().el);

		enditorManager.loadElements([
			ctrl.shapeFactory.createEntity({ position: { x: 25, y: 10 } }),
			ctrl.shapeFactory.createIsa({ position: { x: 40, y: 70 } }),
			ctrl.shapeFactory.createRelationship({ position: { x: 25, y: 130 } }),
			ctrl.shapeFactory.createAssociative({ position: { x: 15, y: 185 } }),
			ctrl.shapeFactory.createAttribute({ position: { x: 65, y: 265 } }),
			ctrl.shapeFactory.createKey({ position: { x: 65, y: 305 } }),
			ctrl.shapeFactory.createComposedAttribute({ position: { x: 30, y: 345 } }),
		]);

		registerShortcuts();
	};

	ctrl.$postLink = () => {
		buildWorkspace();
	};

	ctrl.$onInit = () => {
		ctrl.shapeFactory = new Factory(joint.shapes);
		ctrl.shapeValidator = new Validator();
		ctrl.shapeLinker = new Linker(ctrl.shapeFactory, ctrl.shapeValidator);
		ctrl.entityExtensor = new EntityExtensor(ctrl.shapeFactory, ctrl.shapeValidator, ctrl.shapeLinker);
		ctrl.toolsViewService = new ToolsViewService();
		ctrl.setLoading(true);
		ModelAPI.getModel($stateParams.modelid, $rootScope.loggeduser).then((resp) => {
			const jsonModel = (typeof resp.data.model == "string") ? JSON.parse(resp.data.model) : resp.data.model;
			ctrl.model = resp.data;
			ctrl.model.id = resp.data._id;
			ctrl.model.model = jsonModel;
			configs.graph.fromJSON(jsonModel);
			ctrl.modelState.updatedAt = resp.data.updated
			ctrl.setLoading(false);
		});
	}

	window.onbeforeunload = preventExitService.handleBeforeUnload(ctrl);
	const onBeforeDeregister = $transitions.onBefore({}, preventExitService.handleTransitionStart(ctrl, "conceptual"));
	const onExitDeregister = $transitions.onExit({}, preventExitService.cleanup(ctrl))

	ctrl.$onDestroy = () => {
		ctrl.shapeFactory = null;
		ctrl.shapeValidator = null;
		ctrl.shapeLinker = null;
		ctrl.entityExtensor = null;
		configs.graph = null;
		configs.paper = null;
		configs.keyboardController.unbindAll();
		configs.keyboardController = null;
		preventExitService.cleanup(ctrl)()
		onBeforeDeregister()
		onExitDeregister()
	}
};

export default angular
	.module("app.workspace.conceptual", [modelDuplicatorComponent, preventExitServiceModule, bugReportButton, statusBar])
	.component("editorConceptual", {
		template,
		controller,
	}).name;