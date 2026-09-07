import { dia, linkTools } from '@joint/core';
import erd from '../joint/shapes';

export default class ToolsViewService {
	constructor() {
		const defaultTools = this.#createDefaultTools();
		this.toolsWithInfo = new dia.ToolsView({ tools: [...defaultTools, new erd.InfoButton()] });
		this.tools = new dia.ToolsView({ tools: [...defaultTools, new linkTools.Remove()] })
		this.toolsWithoutRemove = new dia.ToolsView({ tools: defaultTools });
	}

	getToolsView(connectionType = "", editorSource = "") {
		if (connectionType === "Entity-Relationship") return this.toolsWithInfo;
		if (connectionType === "Table-View") return this.toolsWithoutRemove;
		if (connectionType === "Note-Any") return this.tools;
		if (editorSource === "conceptual") return this.toolsWithoutRemove;
		return this.tools;
	}

	#createDefaultTools = () => {
		return [
			new linkTools.Vertices(),
			new linkTools.Segments(),
			new linkTools.SourceArrowhead(),
			new linkTools.TargetArrowhead(),
			new linkTools.Boundary(),
		]
	}

};