import "backbone"
import $ from "jquery";

import * as joint from "jointjs";
import "jointjs/dist/joint.min.css";

import "../../joint/joint.ui.stencil";
import "../../joint/joint.ui.stencil.css";

import "../../joint/br-scroller";

import angular from "angular";
import template from "./conceptual.html"

import shapeFactory from "../service/shapeFactory";

const controller = function (
	ShapeFactory
) {

	const ctrl = this;
	const configs = {
		graph: {},
		paper: {},
		paperScroller: {}
	}

	const buildWorkspace = () => {
		configs.graph = new joint.dia.Graph;
		const content = $('#content');

		configs.paper = new joint.dia.Paper({
			width: content.width(),
			height: content.height(),
			gridSize: 10,
			drawGrid: true,
			model: configs.graph,
			linkConnectionPoint: joint.util.shapePerimeterConnectionPoint
		});

		configs.paperScroller = new joint.ui.PaperScroller({
			paper: configs.paper,
			cursor: 'grab',
			autoResizePaper: true
		});

		content.append(configs.paperScroller.render().el);

		const stencil = new joint.ui.Stencil({
			graph: configs.graph,
			paper: configs.paper,
		});

		$('#stencil-holder').append(stencil.render().el);

		stencil.load([
			ShapeFactory.createAttribute(),
			ShapeFactory.createEntity(),
			ShapeFactory.createAttribute(),
			ShapeFactory.createIsa(),
			ShapeFactory.createRelationship(),
			ShapeFactory.createKey(),
			// ShapeFactory.createAssociative(),
			// ShapeFactory.createComposedAttribute()
		]);

	}

	ctrl.$postLink = () => {
		buildWorkspace();
	};

};

export default angular
	.module("app.workspace.conceptual", [
		shapeFactory
	])
	.component("editorConceptual", {
		template,
		controller,
	}).name;
