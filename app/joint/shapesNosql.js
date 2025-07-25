import * as joint from "jointjs/dist/joint";

const headerHeight = 30;
const tableX = 20;
const tableY = 20;
const cellHeight = 30;
const MAX_ROWS = 50;

const attrs = {
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
	tableBg: {
		x: tableX,
		y: tableY,
		width: 200,
		height: 0,
		fill: "#eee",
		stroke: "#bbb",
		"stroke-width": 1,
		opacity: 0,
	},
	tableHeaderName: {
		x: tableX + 10,
		y: tableY + cellHeight / 2 + 6,
		"font-size": 14,
		fill: "#222",
		opacity: 0,
		text: "Nome",
	},
	tableHeaderType: {
		x: tableX + 110,
		y: tableY + cellHeight / 2 + 6,
		"font-size": 14,
		fill: "#222",
		opacity: 0,
		text: "Tipo",
	},
};

for (let i = 1; i <= MAX_ROWS; i++) {
	attrs[`tableRow${i}`] = { opacity: 0 };
	attrs[`tableRowText${i}`] = { opacity: 0 };
	attrs[`tableRowType${i}`] = { opacity: 0 };
	attrs[`tableRowTypeText${i}`] = { opacity: 0 };
}

const markupBase = [
	{ tagName: "rect", selector: "shadow" },
	{ tagName: "rect", selector: "body" },
	{ tagName: "rect", selector: "header" },
	{ tagName: "text", selector: "headerText" },
	{
		tagName: "g",
		selector: "button",
		children: [
			{ tagName: "rect", selector: "buttonBorder" },
			{ tagName: "path", selector: "buttonIcon" },
		],
	},
	{ tagName: "text", selector: "customText" },
	{ tagName: "rect", selector: "tableBg" },
	{ tagName: "text", selector: "tableHeaderName" },
	{ tagName: "text", selector: "tableHeaderType" },
];

for (let i = 1; i <= MAX_ROWS; i++) {
	markupBase.push({ tagName: "rect", selector: `tableRow${i}` });
	markupBase.push({ tagName: "text", selector: `tableRowText${i}` });
	markupBase.push({ tagName: "rect", selector: `tableRowType${i}` });
	markupBase.push({ tagName: "text", selector: `tableRowTypeText${i}` });
}

const Collection = joint.dia.Element.define(
	"nosql.Collection",
	{
		collapsed: false,
		size: { width: 200, height: 90 },
		supertype: "Collection",
		attrs,
	},
	{
		markup: markupBase,
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

		updateTable: function (customAttributes) {
			const MAX_ROWS = 10;
			const tableY = 30;
			const tableX = 10;
			const cellHeight = 30;
			const col1Width = 90;
			const col2Width = 90;
			const cellWidth = col1Width + col2Width;

			const attrs = this.get("attrs");
			Object.keys(attrs).forEach((key) => {
				if (
					key.startsWith("tableRow") ||
					key.startsWith("tableRowText") ||
					key.startsWith("tableRowType") ||
					key.startsWith("tableRowTypeText")
				) {
					this.attr(key + "/opacity", 0);
					if (key.endsWith("Text")) this.attr(key + "/text", "");
				}
			});

			customAttributes.slice(0, MAX_ROWS).forEach((attr, i) => {
				const rowY = tableY + cellHeight * (i + 1);

				this.attr(`tableRow${i + 1}`, {
					x: tableX,
					y: rowY,
					width: col1Width,
					height: cellHeight,
					fill: "#fff",
					stroke: "#bbb",
					"stroke-width": 1,
					opacity: 1,
				});
				this.attr(`tableRowText${i + 1}`, {
					x: tableX + 10,
					y: rowY + cellHeight / 2 + 6,
					"font-size": 14,
					fill: "#222",
					opacity: 1,
					text: attr.name,
				});

				this.attr(`tableRowType${i + 1}`, {
					x: tableX + col1Width,
					y: rowY,
					width: col2Width,
					height: cellHeight,
					fill: "#fff",
					stroke: "#bbb",
					"stroke-width": 1,
					opacity: 1,
				});
				this.attr(`tableRowTypeText${i + 1}`, {
					x: tableX + col1Width + 10,
					y: rowY + cellHeight / 2 + 6,
					"font-size": 14,
					fill: "#222",
					opacity: 1,
					text: attr.type || "",
				});
			});

			const bgHeight = (customAttributes.length + 1) * cellHeight;
			this.attr({
				"tableBg/height": bgHeight,
				"tableBg/opacity": customAttributes.length > 0 ? 1 : 0,
				"tableBg/width": cellWidth,
				"tableHeaderName/opacity": customAttributes.length > 0 ? 1 : 0,
				"tableHeaderType/opacity": customAttributes.length > 0 ? 1 : 0,
			});

			this.resize(cellWidth + tableX * 2, tableY + bgHeight + 20);

			if (this.realignChildrenInGrid) this.realignChildrenInGrid();

			if (this.resizeAncestorsToFit) this.resizeAncestorsToFit(10);

			this.trigger("change:attrs", this, this.get("attrs"), {});
			if (this.paper && this.paper.draw) this.paper.draw();
		},

		resizeAncestorsToFit: function (margem = 0) {
			const parentIds = this.get("parent");
			if (!parentIds) return;
			const parentId = Array.isArray(parentIds) ? parentIds[0] : parentIds;
			if (!parentId) return;

			const parent = this.graph.getCell(parentId);
			if (!parent) return;

			const embeds = parent.get("embeds") || [];
			let bbox = null;
			embeds.forEach((childId) => {
				const child = this.graph.getCell(childId);
				if (!child) return;
				const childBBox = child.getBBox({ useEmbedding: true });
				if (!bbox) bbox = childBBox.clone();
				else bbox = bbox.union(childBBox);
			});

			const customAttributes = parent.get("customAttributes") || [];
			const tableY = 50;
			const cellHeight = 30;
			const tableBottom = tableY + (customAttributes.length + 1) * cellHeight;
			const parentPos = parent.position();
			const minHeight = parentPos.y + tableBottom + 10;
			if (bbox) {
				bbox = bbox.union({
					x: parentPos.x,
					y: parentPos.y,
					width: parent.size().width,
					height: minHeight - parentPos.y,
				});
			} else {
				bbox = new joint.g.Rect(
					parentPos.x,
					parentPos.y,
					parent.size().width,
					minHeight - parentPos.y,
				);
			}

			const parentSize = parent.size();
			const bboxWidth = bbox.width + margem * 2;
			const bboxHeight = bbox.height + margem * 2;
			if (bboxWidth > parentSize.width || bboxHeight > parentSize.height) {
				parent.resize(
					Math.max(parentSize.width, bboxWidth),
					Math.max(parentSize.height, bboxHeight),
				);
			}

			if (parent.resizeAncestorsToFit) {
				parent.resizeAncestorsToFit(margem);
			}
		},

		realignChildrenInGrid: function () {
			const parent = this;
			const marginTop = 10;
			const marginSide = 10;
			const marginBetweenChildrenX = 10;
			const marginBetweenChildrenY = 10;

			const customAttributes = parent.get("customAttributes") || [];
			const tableY = 30;
			const cellHeight = 30;
			const tableBottom = tableY + (customAttributes.length + 1) * cellHeight;
			const parentPosition = parent.position();
			let parentSize = parent.size();

			let children = (parent.get("embeds") || [])
				.map((id) => parent.graph.getCell(id))
				.filter((child) => !!child);

			if (children.length === 1) {
				const child = children[0];
				const box = child.getBBox({ useEmbedding: true });

				const minWidth = box.width + 2 * marginSide;
				const minHeight = tableBottom + box.height + 2 * marginTop;

				if (parentSize.width < minWidth || parentSize.height < minHeight) {
					parent.resize(
						Math.max(parentSize.width, minWidth),
						Math.max(parentSize.height, minHeight),
					);
					parentSize = parent.size();
				}

				const centeredX = parentPosition.x + (parentSize.width - box.width) / 2;
				const posY = parentPosition.y + tableBottom + marginTop;
				child.position(centeredX, posY);

				const childBBox = child.getBBox();
				const parentBBox = parent.getBBox();
				if (
					childBBox.x < parentBBox.x + marginSide ||
					childBBox.y < parentBBox.y + tableBottom + marginTop
				) {
					child.position(
						parentBBox.x + marginSide,
						parentBBox.y + tableBottom + marginTop,
					);
				}
			} else if (children.length > 1) {
				let childBoxes = children.map((child) =>
					child.getBBox({ useEmbedding: true }),
				);
				const maxGridWidth = parentSize.width - 2 * marginSide;
				const colWidth = Math.max(...childBoxes.map((b) => b.width), 100);
				const nColunas = Math.max(
					1,
					Math.floor(
						(maxGridWidth + marginBetweenChildrenX) /
							(colWidth + marginBetweenChildrenX),
					),
				);

				let nextX = parentPosition.x + marginSide;
				let nextY = parentPosition.y + tableBottom + marginTop;
				let maxAlturaLinha = 0;
				let col = 0;

				childBoxes.forEach((box, idx) => {
					const child = children[idx];
					if (col >= nColunas) {
						nextX = parentPosition.x + marginSide;
						nextY += maxAlturaLinha + marginBetweenChildrenY;
						maxAlturaLinha = 0;
						col = 0;
					}
					const offsetX = (colWidth - box.width) / 2;
					child.position(nextX + offsetX, nextY);

					nextX += colWidth + marginBetweenChildrenX;
					if (box.height > maxAlturaLinha) maxAlturaLinha = box.height;
					col++;
				});

				const totalHeight =
					nextY + maxAlturaLinha + marginBetweenChildrenY - parentPosition.y;
				const totalWidth = Math.max(
					parentSize.width,
					parentPosition.x +
						marginSide +
						nColunas * colWidth +
						(nColunas - 1) * marginBetweenChildrenX +
						marginSide -
						parentPosition.x,
				);
				parent.resize(totalWidth, totalHeight);
			}

			const embeds = this.get("embeds") || [];
			embeds.forEach((childId) => {
				const child = this.graph.getCell(childId);
				if (child && child.toFront) child.toFront();
			});

			children.forEach((child) => {
				if (typeof child.realignChildrenInGrid === "function") {
					child.realignChildrenInGrid();
				}
			});
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
