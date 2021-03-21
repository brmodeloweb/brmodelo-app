import "backbone";
import $ from "jquery";

import * as joint from "jointjs";
import "jointjs/dist/joint.min.css";

import "../../joint/joint.ui.stencil";
import "../../joint/joint.ui.stencil.css";
import "../../joint/br-scroller";
import "../../joint/joint.dia.command";

import angular from "angular";
import template from "./conceptual.html";

import shapeFactory from "../service/shapeFactory";

const controller = function (ShapeFactory) {
	const ctrl = this;
	const configs = {
		graph: {},
		paper: {},
		paperScroller: {},
		commandManager: {}
	};

	ctrl.print = function(){
		window.print();
	}

	ctrl.undoModel = function(){
		configs.commandManager.undo();
	}

	ctrl.redoModel = function(){
		configs.commandManager.redo();
	}

	ctrl.zoomIn = function(){
		configs.paperScroller.zoom(0.2, { max: 2 });
	}

	ctrl.zoomOut = function(){
		configs.paperScroller.zoom(-0.2, { min: 0.2 });
	}

	const buildWorkspace = () => {
		configs.graph = new joint.dia.Graph();

		configs.commandManager = new joint.dia.CommandManager({ graph: configs.graph })

		const content = $("#content");

		configs.paper = new joint.dia.Paper({
			width: content.width(),
			height: content.height(),
			gridSize: 10,
			drawGrid: true,
			model: configs.graph,
			linkConnectionPoint: joint.util.shapePerimeterConnectionPoint,
		});

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
			ShapeFactory.createEntity({position: {x: 25, y: 10}}),
			ShapeFactory.createIsa({position: {x: 40, y: 70}}),
			ShapeFactory.createRelationship({position: {x: 25, y: 130}}),
			ShapeFactory.createAssociative({position: {x: 15, y: 185}}), 
			ShapeFactory.createAttribute({position: {x: 65, y: 265}}),
			ShapeFactory.createKey({position: {x: 65, y: 305}}),
			// ShapeFactory.createComposedAttribute()
		]);
	};

	ctrl.$postLink = () => {
		buildWorkspace();
	};
};

export default angular
	.module("app.workspace.conceptual", [shapeFactory])
	.component("editorConceptual", {
		template,
		controller,
	}).name;
