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

// import elementFactory from "../service/conceptualFactory"

const ConceptualController = function (
	ShapeFactory
) {

	const ctrl = this;

	const buildWorkspace = () => {
		ctrl.graph = new joint.dia.Graph;
		const content = $('#content');

		ctrl.paper = new joint.dia.Paper({
			width: content.width(),
			height: content.height(),
			gridSize: 10,
			drawGrid: true,
			model: ctrl.graph,
			linkConnectionPoint: joint.util.shapePerimeterConnectionPoint
		});

		ctrl.paperScroller = new joint.ui.PaperScroller({
			paper: ctrl.paper,
			cursor: 'grab',
			autoResizePaper: true
		});

		content.append(ctrl.paperScroller.render().el);

		const stencil = new joint.ui.Stencil({
			graph: ctrl.graph,
			paper: ctrl.paper,
		});

		$('#stencil-holder').append(stencil.render().el);

		stencil.load([
			ShapeFactory.createAttribute(),
			ShapeFactory.createIsa(),
			ShapeFactory.createRelationship(),
			ShapeFactory.createKey(),
			// ConceptualFactory.createAssociative(),
			// ConceptualFactory.createComposedAttribute()
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
		controller: ConceptualController,
	}).name;
