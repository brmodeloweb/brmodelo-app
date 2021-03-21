import "backbone";
import $ from "jquery";

import * as joint from "jointjs";
import "jointjs/dist/joint.min.css";

import "../../joint/joint.ui.stencil";
import "../../joint/joint.ui.stencil.css";
import "../../joint/br-scroller";
import "../../joint/joint.dia.command";
import shapes from "../../joint/shapes";
joint.shapes.erd = shapes;

import angular from "angular";
import template from "./conceptual.html";

import shapeFactory from "../service/shapeFactory";

const controller = function (ShapeFactory, ModelAPI, $stateParams, $rootScope, $timeout) {
	const ctrl = this;
	ctrl.feedback = {
		message: "",
		showing: false
	}
	const configs = {
		graph: {},
		paper: {},
		paperScroller: {},
		commandManager: {},
		model: {
			id: '',
			name: '',
			type: 'conceptual',
			model: '',
			user: $rootScope.loggeduser
		}
	};

	ctrl.showFeedback = (show, newMessage) => {
		$timeout(() => {
			ctrl.feedback.showing = show;
			ctrl.feedback.message = newMessage;
		});
		// $rootScope.$digest();
		// console.log(ctrl.feedback);
	}

	ctrl.saveModel = () => {
		configs.model.model = JSON.stringify(configs.graph);
		ModelAPI.updateModel(configs.model).then(function(res){
			ctrl.showFeedback(true, "Salvo com sucesso!");
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

	const setModel = (loadedModel) => {
		configs.model.model = loadedModel;
		configs.model.name = loadedModel.name;
		configs.model.type = loadedModel.type;
		configs.model.id = loadedModel._id;
		ctrl.modelName = loadedModel.name;
	}

	const registerPaperEvents = (paper) => {
		paper.on('blank:pointerdown', function(evt, x, y) {
			ctrl.showFeedback(false, "");
		});
	}

	const buildWorkspace = () => {
		configs.graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });

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
			ShapeFactory.createEntity({ position: { x: 25, y: 10 } }),
			ShapeFactory.createIsa({ position: { x: 40, y: 70 } }),
			ShapeFactory.createRelationship({ position: { x: 25, y: 130 } }),
			ShapeFactory.createAssociative({ position: { x: 15, y: 185 } }),
			ShapeFactory.createAttribute({ position: { x: 65, y: 265 } }),
			ShapeFactory.createKey({ position: { x: 65, y: 305 } }),
			// ShapeFactory.createComposedAttribute()
		]);
	};

	ctrl.$postLink = () => {
		buildWorkspace();
	};

	ctrl.$onInit = () => {
		ModelAPI.getModel($stateParams.modelid, $rootScope.loggeduser).then((resp) => {
			const jsonModel = (typeof resp.data.model == "string") ? JSON.parse(resp.data.model) : resp.data.model;
			setModel(resp.data);
			configs.graph.fromJSON(jsonModel);
		});
	}
};

export default angular
	.module("app.workspace.conceptual", [shapeFactory])
	.component("editorConceptual", {
		template,
		controller,
	}).name;
