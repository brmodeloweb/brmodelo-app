import * as joint from "jointjs/dist/joint";

export default class toolsViewService {
	constructor(shapeFactory) {
		if(shapeFactory != null) {
			this.toolsWithInfo = new joint.dia.ToolsView({tools: [...this.#createDefaultTools(), shapeFactory.createInfoButton()]});
		}
		this.tools = new joint.dia.ToolsView({tools: this.#createDefaultTools()})
	}

	getToolsView(conectionType = "") {
		if(conectionType === "Entity-Relationship") {
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