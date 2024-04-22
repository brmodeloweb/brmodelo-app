import "backbone";
import $ from "jquery";

import * as joint from "jointjs/dist/joint";

import angular from "angular";
import template from "./publicview.html";

import "../editor/editorScroller";

import statusBar from "../components/statusBar";
import bugReportButton from "../components/bugReportButton";
import KeyboardController, { types } from "../components/keyboardController";

const controller = function (ModelAPI, $stateParams, $rootScope, $timeout, $uibModal, $state, $transitions, $filter) {
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
	const configs = {
		graph: {},
		paper: {}
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

	ctrl.print = () => {
		window.print();
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

	const registerShortcuts = () => {
		configs.keyboardController.registerHandler(types.ZOOM_IN, () => ctrl.zoomIn());
		configs.keyboardController.registerHandler(types.ZOOM_OUT, () => ctrl.zoomOut());
		configs.keyboardController.registerHandler(types.ZOOM_NONE, () => ctrl.zoomNone());
	}

	const buildWorkspace = () => {
		configs.graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });

		const content = $("#content");

		configs.paper = new joint.dia.Paper({
			width: content.width(),
			height: content.height(),
			gridSize: 10,
			drawGrid: true,
			model: configs.graph,
			linkConnectionPoint: joint.util.shapePerimeterConnectionPoint,
			cellViewNamespace: joint.shapes,
			linkPinning: false
		});

		configs.keyboardController = new KeyboardController(configs.paper.$document);

		configs.editorScroller = new joint.ui.EditorScroller({
			paper: configs.paper,
			cursor: "grabbing",
			autoResizePaper: true,
		});
		content.append(configs.editorScroller.render().el);

		registerShortcuts();
	};

	ctrl.$postLink = () => {
		buildWorkspace();
	};

	ctrl.$onInit = () => {
		ctrl.setLoading(true);
		ModelAPI.getModel($stateParams.modelid, $rootScope.loggeduser).then((resp) => {
			const jsonModel = (typeof resp.data.model == "string") ? JSON.parse(resp.data.model) : resp.data.model;
			configs.graph.fromJSON(jsonModel);
			ctrl.modelState.updatedAt = resp.data.updated
			ctrl.setLoading(false);
		}).catch((error) => {
			if(error.status == 404 || error.status == 401) {
				//$state.go("noaccess");
			}
		});
	}

	ctrl.$onDestroy = () => {
		configs.graph = null;
		configs.paper = null;
		configs.keyboardController.unbindAll();
		configs.keyboardController = null;
		onBeforeDeregister()
		onExitDeregister()
	}
};

export default angular
	.module("app.publicview", [bugReportButton, statusBar])
	.component("publicview", {
		template,
		controller,
	}).name;