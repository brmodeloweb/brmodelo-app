import * as joint from "@joint/core/dist/joint";

export default class ToolsViewService {
	constructor(infoButton) {
		const defaultTools = this.#createDefaultTools();
		this.toolsWithInfo = new joint.dia.ToolsView({ tools: [...defaultTools, infoButton, new joint.linkTools.Remove()] });
		this.tools = new joint.dia.ToolsView({ tools: [...defaultTools, new joint.linkTools.Remove()] })
		this.toolsWithoutRemove = new joint.dia.ToolsView({ tools: defaultTools });
	}

	getToolsView(conectionType = "") {
		if (conectionType === "Entity-Relationship") return this.toolsWithInfo;
		if (conectionType === "Table-View") return this.toolsWithoutRemove;
		return this.tools;
	}

	#createDefaultTools = () => {
		return [
			new joint.linkTools.Vertices(),
			new joint.linkTools.Segments(),
			new joint.linkTools.SourceArrowhead(),
			new joint.linkTools.TargetArrowhead(),
			new joint.linkTools.Boundary(),
		]
	}
};