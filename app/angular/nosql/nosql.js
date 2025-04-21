import "backbone";
import $ from "jquery";

import * as joint from "jointjs/dist/joint";

import "../editor/editorManager";
import "../editor/editorScroller";
import "../editor/editorActions";
import "../editor/elementActions";
import "../editor/elementSelector";

import shapes from "../../joint/shapes";
joint.shapes.erd = shapes;

import shapesNosql from "../../joint/shapesNosql";
///joint.shapes.container.Base = cont;
import angular from "angular";
import template from "./nosql.html";

import modelDuplicatorComponent from "../components/duplicateModelModal";
import shareModelModal from "../components/shareModelModal";
import statusBar from "../components/statusBar";

import KeyboardController, { types } from "../components/keyboardController";
import ToolsViewService from "../service/toolsViewService";
import preventExitServiceModule from "../service/preventExitService";
import iconConceptual from "../components/icons/conceptual";
import supportBannersList from "../components/supportBannersList";
//import { container } from "webpack";

const controller = function (
	ModelAPI,
	$stateParams,
	$rootScope,
	$timeout,
	$uibModal,
	$state,
	$transitions,
	preventExitService,
	$filter,
) {
	const ctrl = this;
	ctrl.modelState = {
		isDirty: false,
		updatedAt: new Date(),
	};
	ctrl.feedback = {
		message: "",
		showing: false,
	};
	ctrl.loading = true;
	ctrl.model = {
		id: "",
		name: "",
		type: "conceptual",
		model: "",
		user: $rootScope.loggeduser,
	};
	ctrl.selectedElement = {};
	const configs = {
		graph: {},
		paper: {},
		editorActions: {},
		keyboardController: null,
		selectedElementActions: null,
	};

	const setIsDirty = (isDirty) => {
		ctrl.modelState.isDirty = isDirty;
	};

	ctrl.setLoading = (show) => {
		$timeout(() => {
			ctrl.loading = show;
		});
	};

	ctrl.showFeedback = (show, newMessage) => {
		$timeout(() => {
			ctrl.feedback.showing = show;
			ctrl.feedback.message = $filter("translate")(newMessage);
		});
	};

	ctrl.saveModel = () => {
		ctrl.modelState.updatedAt = new Date();
		setIsDirty(false);
		ctrl.setLoading(true);
		ctrl.model.model = JSON.stringify(configs.graph);
		ModelAPI.updateModel(ctrl.model).then(function (res) {
			ctrl.showFeedback(true, "Successfully saved!");
			ctrl.setLoading(false);
		});
	};

	ctrl.print = () => {
		window.print();
	};

	ctrl.undoModel = () => {
		configs.editorActions.undo();
	};

	ctrl.redoModel = () => {
		configs.editorActions.redo();
	};

	ctrl.zoomIn = () => {
		configs.editorScroller.zoom(0.1, { max: 2 });
	};

	ctrl.zoomOut = () => {
		configs.editorScroller.zoom(-0.1, { min: 0.2 });
	};

	ctrl.zoomNone = () => {
		configs.editorScroller.zoom();
	};

	ctrl.duplicateModel = (model) => {
		const modalInstance = $uibModal.open({
			animation: true,
			template:
				'<duplicate-model-modal suggested-name="$ctrl.suggestedName" close="$close(result)" dismiss="$dismiss(reason)"></duplicate-model-modal>',
			controller: function () {
				const $ctrl = this;
				$ctrl.suggestedName = $filter("translate")("MODEL_NAME (copy)", {
					name: model.name,
				});
			},
			controllerAs: "$ctrl",
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
				window.open($state.href("conceptual", { modelid: newModel._id }));
				ctrl.showFeedback(true, "Successfully duplicated!");
				ctrl.setLoading(false);
			});
		});
	};

	ctrl.duplicateModel = (model) => {
		const modalInstance = $uibModal.open({
			animation: true,
			template: `<duplicate-model-modal
						suggested-name="$ctrl.suggestedName"
						close="$close(result)"
						dismiss="$dismiss(reason)"
						user-id=$ctrl.userId
						model-id=$ctrl.modelId>
					</duplicate-model-modal>`,
			controller: function () {
				const $ctrl = this;
				$ctrl.suggestedName = $filter("translate")("MODEL_NAME (copy)", {
					name: model.name,
				});
				$ctrl.modelId = model._id;
				$ctrl.userId = model.who;
			},
			controllerAs: "$ctrl",
		}).result;
		modalInstance
			.then((newModel) => {
				window.open(
					$state.href("logic", { references: { modelid: newModel._id } }),
				);
				ctrl.showFeedback(true, "Successfully duplicated!");
			})
			.catch((error) => {
				console.error(error);
			});
	};

	ctrl.convertModel = (conceptualModel) => {
		const model = {
			name: conceptualModel.name + $filter("translate")("_converted"),
			user: $rootScope.loggeduser,
			type: "logic",
			model: '{"cells":[]}',
		};
		ModelAPI.saveModel(model).then((newModel) => {
			window.open(
				$state.href("logic", {
					references: {
						modelid: newModel._id,
						conversionId: conceptualModel._id,
					},
				}),
				"_blank",
			);
		});
	};

	ctrl.shareModel = (model) => {
		const modalInstance = $uibModal.open({
			animation: true,
			backdrop: "static",
			keyboard: false,
			template:
				'<share-model-modal close="$close(result)" dismiss="$dismiss()" model-id="$ctrl.modelId"></share-model-modal>',
			controller: function () {
				const $ctrl = this;
				$ctrl.modelId = model._id;
			},
			controllerAs: "$ctrl",
		}).result;
		modalInstance
			.then(() => {
				ctrl.showFeedback(
					true,
					$filter("translate")(
						"Sharing configuration has been updated successfully!",
					),
				);
			})
			.catch((reason) => {
				console.log("Modal dismissed with reason", reason);
			});
	};

	ctrl.unselectAll = () => {
		ctrl.showFeedback(false, "");
		ctrl.onSelectElement(null);
		if (configs.selectedElementActions != null) {
			configs.selectedElementActions.remove();
			configs.selectedElementActions = null;
		}
	};

	ctrl.onSelectElement = (cellView) => {
		if (cellView != null) {
			configs.elementSelector.cancel();
			console.log(cellView);
			$timeout(() => {
				ctrl.selectedElement = {
					value: cellView.model.attributes?.attrs?.headerText?.text,
					type: cellView.model.attributes.type,
					element: cellView,
				};
			});
			return;
		}

		$timeout(() => {
			ctrl.selectedElement = {
				value: "",
				type: "blank",
				element: null,
			};
		});
	};

	ctrl.onUpdate = (event) => {
		if (event.type == "name") {
			ctrl.selectedElement.element.model.updateName(event.value);
		}
	};

	const registerPaperEvents = (paper) => {
		paper.on("blank:pointerdown", (evt) => {
			ctrl.unselectAll();
			if (!configs.keyboardController.spacePressed) {
				configs.elementSelector.start(evt);
			} else {
				configs.editorScroller.startPanning(evt);
			}
			configs.elementSelector.setCopyContext(evt);
		});

		paper.on("link:options", (cellView) => {
			ctrl.onSelectElement(cellView);
		});

		paper.on("element:pointerup", (cellView, evt, x, y) => {
			ctrl.onSelectElement(cellView);

			const elementActions = new joint.ui.ElementActions({
				cellView: cellView,
				boxContent: false,
			});

			configs.selectedElementActions = elementActions;
			elementActions.on("action:link:add", function (link) {});

			elementActions.render();
		});

		/////////////////////make all the actions of embeding
		paper.on("element:mouseover", (cellView, evt, x, y) => {
			//			console.log(cellView.model);
			try {
				const parents = configs.graph.findModelsUnderElement(cellView.model);
				if (parents.length > 0) {
					let parent = parents[0];
					if (parents.length > 1) {
						parent = parents[parents.length - 1];
						parent.embed([cellView.model]);
						parent.fitToChildElements();
					} else {
						parent.embed([cellView.model]);
						parent.fitToChildElements();
					}
				}
			} catch (error) {
				console.log(error);
			}
		});

		paper.on("element:pointerdblclick", () => {
			$rootScope.$broadcast("command:openmenu");
		});

		configs.paper.on("link:mouseenter", (linkView) => {
			const conectionType = ctrl.shapeLinker.getConnectionTypeFromLink(
				linkView.model,
			);
			const toolsView = ctrl.toolsViewService.getToolsView(conectionType);
			linkView.addTools(toolsView);
		});

		configs.paper.on("link:mouseleave", (linkView) => {
			linkView.removeTools();
		});
	};

	const registerShortcuts = () => {
		configs.keyboardController.registerHandler(types.SAVE, () =>
			ctrl.saveModel(),
		);
		configs.keyboardController.registerHandler(types.UNDO, () =>
			ctrl.undoModel(),
		);
		configs.keyboardController.registerHandler(types.REDO, () =>
			ctrl.redoModel(),
		);
		configs.keyboardController.registerHandler(types.ZOOM_IN, () =>
			ctrl.zoomIn(),
		);
		configs.keyboardController.registerHandler(types.ZOOM_OUT, () =>
			ctrl.zoomOut(),
		);
		configs.keyboardController.registerHandler(types.ZOOM_NONE, () =>
			ctrl.zoomNone(),
		);
		configs.keyboardController.registerHandler(types.ESC, () =>
			ctrl.unselectAll(),
		);
		configs.keyboardController.registerHandler(types.COPY, () =>
			configs.elementSelector.copyAll(),
		);
		configs.keyboardController.registerHandler(types.PASTE, () =>
			configs.elementSelector.pasteAll(),
		);
		configs.keyboardController.registerHandler(types.DELETE, () =>
			configs.elementSelector.deleteAll(),
		);
	};

	const registerGraphEvents = (graph) => {
		graph.on("change", () => {
			setIsDirty(true);
		});

		graph.on("remove", () => {
			setIsDirty(true);
		});

		graph.on("change:position", function (cell) {});

		graph.on("add", (model) => {
			setIsDirty(true);
			if (model instanceof joint.dia.Link) return;
		});
	};

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
			cellViewNamespace: joint.shapes,
			linkPinning: false,
		});

		configs.keyboardController = new KeyboardController(
			configs.paper.$document,
		);

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

		configs.editorActions = new joint.ui.EditorActions({
			graph: configs.graph,
			paper: configs.paper,
		});

		$(".elements-holder").append(enditorManager.render().el);

		configs.elementSelector = new joint.ui.ElementSelector({
			paper: configs.paper,
			graph: configs.graph,
			model: new Backbone.Collection(),
		});

		var containerParent = new shapesNosql.parent({
			size: { width: 100, height: 100 },
			z: 1,
			attrs: { headerText: { text: "parent" } },
			position: { x: 25, y: 10 },
		});

		enditorManager.loadElements([containerParent]);

		registerShortcuts();
	};

	ctrl.$postLink = () => {
		buildWorkspace();
	};

	ctrl.$onInit = () => {
		ctrl.toolsViewService = new ToolsViewService();
		ctrl.setLoading(true);
		ModelAPI.getModel($stateParams.modelid, $rootScope.loggeduser)
			.then((resp) => {
				const jsonModel =
					typeof resp.data.model == "string"
						? JSON.parse(resp.data.model)
						: resp.data.model;
				ctrl.model = resp.data;
				ctrl.model.id = resp.data._id;
				ctrl.model.model = jsonModel;
				configs.graph.fromJSON(jsonModel);
				ctrl.modelState.updatedAt = resp.data.updated;
				ctrl.setLoading(false);
			})
			.catch((error) => {
				if (error.status == 404 || error.status == 401) {
					$state.go("noaccess");
				}
			});
	};

	window.onbeforeunload = preventExitService.handleBeforeUnload(ctrl);
	const onBeforeDeregister = $transitions.onBefore(
		{},
		preventExitService.handleTransitionStart(ctrl, "conceptual"),
	);
	const onExitDeregister = $transitions.onExit(
		{},
		preventExitService.cleanup(ctrl),
	);

	ctrl.$onDestroy = () => {
		configs.graph = null;
		configs.paper = null;
		configs.keyboardController.unbindAll();
		configs.keyboardController = null;
		preventExitService.cleanup(ctrl)();
		onBeforeDeregister();
		onExitDeregister();
	};
};

export default angular
	.module("app.workspace.nosql", [
		modelDuplicatorComponent,
		preventExitServiceModule,
		statusBar,
		shareModelModal,
		iconConceptual,
		supportBannersList,
	])
	.component("editorNoSQL", {
		template,
		controller,
	}).name;
