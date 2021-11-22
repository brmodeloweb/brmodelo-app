import * as joint from "jointjs/dist/joint";

export default class ToolsViewService {
	constructor() {
		const defaultTools = this.#createDefaultTools();
		this.toolsWithInfo = new joint.dia.ToolsView({ tools: [...defaultTools, new joint.shapes.erd.InfoButton()] });
		this.tools = new joint.dia.ToolsView({ tools: defaultTools })
	}

	getToolsView(conectionType = "") {
		if (conectionType === "Entity-Relationship") {
			return this.toolsWithInfo;
		}
		return this.tools;
	}

	#createDefaultTools = () => {
		return [
			new joint.linkTools.Vertices(),
			new joint.linkTools.Segments(),
			new joint.linkTools.SourceArrowhead(),
			new joint.linkTools.TargetArrowhead(),
			new joint.linkTools.Boundary(),
			new joint.linkTools.Remove()
		]
	}

};