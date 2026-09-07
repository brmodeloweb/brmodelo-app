import { dia } from '@joint/core';

const Note = dia.Element.define('custom.Note', {
	supertype: "Note",
	size: { width: 80, height: 40 },
	attrs: {
		".outer": {
			fill: "lightgray",
			stroke: "lightgray",
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
				width: 300,
				height: 210,
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
	}}, {
	markup: '<g class="rotatable"><g class="scalable"><polygon class="outer"/><polygon class="inner"/></g><text/></g>',
	useCSSSelectors: true,
	getType() {
		return "custom.Note";
	},
	setColor: function (newColor) {
		this.attr('.outer/fill', newColor);
		this.attr('.outer/stroke', newColor);
	}
});

const NoteView = dia.ElementView.extend({
	initialize: function () {
		dia.ElementView.prototype.initialize.apply(this, arguments);
	},
	setText: function (newText) {
		this.model.attributes.attrs.text.text = newText;
		this.update();
		const textBox = this.$el.find("text")[0].getBBox();
		const currentSize = this.model.get('size');
		const newWidth = textBox.width > 80 ? textBox.width + 10 : currentSize.width;
		const newHeight = textBox.height > 40 ? textBox.height + 10 : currentSize.height;
		this.model.resize(newWidth, newHeight);
	},
});

export default {
	Note,
	NoteView
};