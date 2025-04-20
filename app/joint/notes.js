import * as joint from "jointjs/dist/joint";
import _ from "lodash";

const Note = joint.dia.Element.extend({
	markup: '<g class="rotatable"><g class="scalable"><polygon class="outer"/><polygon class="inner"/></g><text/></g>',
	defaults: _.defaultsDeep(
		{
			type: "custom.Note",
			supertype: "Note",
			size: { width: 80, height: 40 },
			attrs: {
				".outer": {
					fill: "#afbccf",
					stroke: "#afbccf",
					"stroke-width": 1,
					points: "100,0 100,60 0,60 0,0",
				},
				".inner": {
					fill: "#79d297",
					stroke: "#27AE60",
					"stroke-width": 1,
					points: "95,5 95,55 5,55 5,5",
					display: "none",
				},
				text: {
					text: "Nota",
					textWrap: {
						width: 200,
						height: 200,
						ellipsis: true,
					},
					"font-family": "Arial",
					"font-size": 14,
					ref: ".outer",
					"ref-x": 0.5,
					"ref-y": 0.5,
					"x-alignment": "middle",
					"y-alignment": "middle",
				},
			},
		},
		joint.dia.Element.prototype.defaults
	),
	getType() {
		return "custom.Note";
	}
});

const NoteView = joint.dia.ElementView.extend({
	initialize: function () {
		joint.dia.ElementView.prototype.initialize.apply(this, arguments);
	},
	setText: function (newText) {
		this.model.attributes.attrs.text.text = newText;
		this.update();
		const textBox = this.$el.find("text")[0].getBBox();
		if (textBox.width > 80) {
			this.model.attributes.size.width = textBox.width + 10;
			this.resize();
		}
		if (textBox.height > 40) {
			this.model.attributes.size.height = textBox.height + 10;
			this.resize();
		}
	},
	setColor: function (newColor) {
		this.model.attributes.attrs[".outer"].fill = newColor;
		this.model.attributes.attrs[".outer"].stroke = newColor;
		this.update();
	}
});

export default {
	Note,
	NoteView
};