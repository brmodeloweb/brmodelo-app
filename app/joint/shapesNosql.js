import * as joint from "jointjs/dist/joint";

var headerHeight = 30;

const Collection = joint.dia.Element.define(
	"nosql.Collection",
	{
		collapsed: false,
		size: { width: 50, height: 50 },
		supertype: "Collection",
		attrs: {
			customText: {
				text: "",
				textVerticalAnchor: "middle",
				textAnchor: "start",
				refX: 8,
				refY: headerHeight + 20,
				fontSize: 14,
				fontFamily: "sans-serif",
				letterSpacing: 1,
				fill: "#333333",
				textWrap: {
					width: 120,
					maxLineCount: 2,
					ellipsis: "..",
				},
				style: {
					textShadow: "1px 1px #DDDDDD",
				},
			},
			root: {
				magnetSelector: "body",
			},
			shadow: {
				refWidth: "100%",
				refHeight: "100%",
				x: 3,
				y: 3,
				fill: "#000000",
				opacity: 0.05,
			},
			body: {
				refWidth: "100%",
				refHeight: "100%",
				strokeWidth: 2,
				stroke: "#000000",
				fill: "#FCFCFC",
			},
			header: {
				refWidth: "100%",
				height: headerHeight,
				strokeWidth: 0.5,
				stroke: "#000000",
				fill: "#000000",
			},
			headerText: {
				textVerticalAnchor: "middle",
				textAnchor: "start",
				refX: 8,
				refY: headerHeight / 2,
				fontSize: 16,
				fontFamily: "sans-serif",
				letterSpacing: 1,
				fill: "#FFFFFF",
				textWrap: {
					width: 0,
					maxLineCount: 1,
					ellipsis: "..",
				},
				style: {
					textShadow: "1px 1px #222222",
				},
			},
		},
	},
	{
		markup: [
			{
				tagName: "rect",
				selector: "shadow",
			},
			{
				tagName: "rect",
				selector: "body",
			},
			{
				tagName: "rect",
				selector: "header",
			},
			{
				tagName: "text",
				selector: "headerText",
			},
			{
				tagName: "g",
				selector: "button",
				children: [
					{
						tagName: "rect",
						selector: "buttonBorder",
					},
					{
						tagName: "path",
						selector: "buttonIcon",
					},
				],
			},
			{
				tagName: "text",
				selector: "customText",
			},
		],

		toggle: function (shouldCollapse) {
			var buttonD;
			var collapsed =
				shouldCollapse === undefined ? !this.get("collapsed") : shouldCollapse;
			if (collapsed) {
				buttonD = "M 2 7 12 7 M 7 2 7 12";
				this.resize(140, 30);
				this.fitToChildElements();
			} else {
				buttonD = "M 2 7 12 7";
				this.fitToChildElements();
			}
			this.attr(["buttonIcon", "d"], buttonD);
			this.set("collapsed", collapsed);
		},

		isCollapsed: function () {
			return Boolean(this.get("collapsed"));
		},

		fitToChildElements: function () {
			var padding = 10;
			this.fitToChildren({
				padding: {
					top: headerHeight + padding,
					left: padding,
					right: padding,
					bottom: padding,
				},
			});
		},

		fitAncestorElements: function () {
			var padding = 10;
			this.fitParent({
				deep: true,
				padding: {
					top: headerHeight + padding,
					left: padding,
					right: padding,
					bottom: padding,
				},
			});
		},

		updateName: function (name) {
			this.attr("headerText/text", name);
		},
		updateCustomText: function (text) {
			this.attr("customText/text", text);
		},
	},
);

const CollectionView = joint.dia.ElementView.extend({
	initialize: function () {
		joint.dia.ElementView.prototype.initialize.apply(this, arguments);
	},
});

export default {
	Collection,
	CollectionView,
};
