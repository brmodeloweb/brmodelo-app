import uml from "../../../joint/table";
import logic from "../../../joint/logic";

export default class LogicFactory {

	constructor() {
		this.shapes = uml;
		this.logicShapes = logic;
	}

	createView = (customConfig = {}) => {
		const defaultConfig = {
			position: { x: 12, y: 155 },
			size: { width: 100, height: 100 },
			name: 'View',
			attributes: [],
			attrs: {
				'.uml-class-name-rect': {
					fill: 'lightgray',
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
		};

		return new this.shapes.Abstract({ ...defaultConfig, ...customConfig });
	};

	createNewTable = (customConfig = {}) => {
		const defaultConfig = {
			position: { x: 12, y: 15 },
			size: { width: 100, height: 100 },
			name: 'Table',
			rows: [],
			rowHeight: 30,
			headerHeight: 40,
			minBodyHeight: 60,
			columnWidths: {
				name: 0.4,      // Left column
				metadata: 0.6   // Right column (constraints + type inline)
			}
		};

		return new this.logicShapes.Table({ ...defaultConfig, ...customConfig });
	};

}