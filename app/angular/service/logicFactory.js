import angular from "angular";

import * as joint from "jointjs";
import "jointjs/dist/joint.min.css";

import tables from "../../joint/table";
joint.shapes.uml = tables;

const logicFactory = () => {

	var logic = joint.shapes.uml;

	const _createTable = function () {
		var table = new logic.Class({
			position: { x: 12, y: 15 },
			size: { width: 100, height: 100 },
			name: 'Tabela',
			attributes: [],
			attrs: {
				'.uml-class-name-rect': {
					fill: '#fff',
					stroke: '#000',
					'stroke-width': 0.5,
				},
				'.uml-class-attrs-rect': {
					fill: '#fff',
					stroke: '#000',
					'stroke-width': 0.5
				},
				'.uml-class-methods-rect': {
					fill: '#fff',
					stroke: '#000',
					'stroke-width': 0.5
				},
				'.uml-class-attrs-text': {
					ref: '.uml-class-attrs-rect',
					'ref-y': 0.5,
					'y-alignment': 'middle'
				}
			}
		});
		return table;
	}

	return {
		createTable: _createTable
	}

}

export default angular
	.module("app.LogicFactory", [])
	.factory("LogicFactory", logicFactory).name;
