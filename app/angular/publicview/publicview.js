import "backbone";
import $ from "jquery";
import "./publicView.scss"

import * as joint from "jointjs/dist/joint";
import erd from "../../joint/shapes";
import uml from "../../joint/table";
joint.shapes.erd = erd;
joint.shapes.uml = uml;

import angular from "angular";
import template from "./publicview.html";

import "../editor/editorScroller";

import statusBar from "../components/statusBar";
import bugReportButton from "../components/bugReportButton";
import KeyboardController, { types } from "../components/keyboardController";
import iconModelConceptual from "../components/icons/conceptual"
import iconModelLogic from "../components/icons/logic"

const controller = function (ModelAPI, $stateParams, $timeout, $state) {
	const ctrl = this;
	ctrl.loading = false;
	ctrl.model = {
		name: ""
	}
	const configs = {
		graph: {},
		paper: {}
	};

	ctrl.setLoading = (show) => {
		$timeout(() => {
			ctrl.loading = show;
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
			linkPinning: false,
			cellViewNamespace: joint.shapes
		});

		configs.keyboardController = new KeyboardController(configs.paper.$document);

		configs.editorScroller = new joint.ui.EditorScroller({
			paper: configs.paper,
			cursor: "grabbing",
			autoResizePaper: true,
		});
		content.append(configs.editorScroller.render().el);

		registerShortcuts();
		registerPaperEvents(configs.paper);
	};

	const registerPaperEvents = (paper) => {
		paper.on('blank:pointerdown', (evt) => {
			if(configs.keyboardController.spacePressed){
				configs.editorScroller.startPanning(evt);
			}
		});
	}

	ctrl.$postLink = () => {
		buildWorkspace();
	};

	ctrl.$onInit = () => {
		ctrl.setLoading(true);

		ModelAPI.getSharedModel($stateParams.modelshareid).then((resp) => {
			const jsonModel = (typeof resp.data.model == "string") ? JSON.parse(resp.data.model) : resp.data.model;
			if(resp.data.type === 'conceptual') {
				configs.paper.options.linkConnectionPoint = joint.util.shapePerimeterConnectionPoint;
			}
			configs.graph.fromJSON(jsonModel);
			ctrl.model.name = resp.data.name;
			ctrl.model.type = resp.data.type;
			ctrl.setLoading(false);
			configs.paper.freeze();
		}).catch((error) => {
			ctrl.setLoading(false);
			if(error.status == 404 || error.status == 401) {
				$state.go("noaccess");
			}
		});
	}

	ctrl.$onDestroy = () => {
		configs.graph = null;
		configs.paper = null;
		configs.keyboardController.unbindAll();
		configs.keyboardController = null;
	}
};

export default angular
	.module("app.publicview", [bugReportButton, statusBar, iconModelConceptual, iconModelLogic])
	.component("publicview", {
		template,
		controller,
	}).name;