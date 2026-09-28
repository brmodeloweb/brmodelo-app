import nosql from "../../../joint/nosql";

export default class NoSqlFactory {

	constructor() {
		this.shapes = nosql;
	}

	createCollection = (customConfig = {}) => {
		const defaultConfig = {
			position: { x: 15, y: 20 },
			size: { width: 100, height: 70 },
			name: 'Collection',
			rows: [],
			attrs: {
				headerText: { text: 'Collection' },
				header: { fill: '#808080' }
			}
		};

		return new this.shapes.Collection({ ...defaultConfig, ...customConfig });
	};

}
