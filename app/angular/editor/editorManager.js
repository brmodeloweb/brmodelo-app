import $ from "jquery";
import "backbone";
import * as joint from "jointjs/dist/joint";

const Handlebars = {
    template: (content) => {
        return () => {
            return content();
        }
    }
};

joint.templates = joint.templates || {};
joint.templates.draggable = joint.templates.draggable || {};
joint.templates.draggable["elements.html"] = Handlebars.template(() => {
    return '<div class="elements"></div>\n';
});
joint.templates.draggable["draggable-paper.html"] = Handlebars.template(() => {
    return '<div class="draggable-paper"></div>\n<div class="content"></div>\n\n'
});

joint.ui.EditorManager = Backbone.View.extend({
    className: "elements-list",
    options: {
        width: 126,
        height: 500
    },
	initialize(configs) {
		this.options = { ...this.options, ...configs } || {};
		this.graphs = {};
		this.papers = {};

		this.onDrag = this.onDrag.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);

		$(document.body).on({
			"mousemove.elements-holder touchmove.elements-holder": this.onDrag,
			"mouseup.elements-holder touchend.elements-holder": this.onDragEnd
		});
	},
    render: function () {
        this.$el.html(joint.templates.draggable["draggable-paper.html"](this.template));
        this.$content = this.$(".content");
        this.$content.append($(joint.templates.draggable["elements.html"]()));
        this.graphs.originalGraph = new joint.dia.Graph;

        const paperConfig = {
            width: this.options.width,
            height: this.options.height,
            interactive: false
        };

		this.papers.originalGraph = new joint.dia.Paper({
			...paperConfig,
			el: this.$(".elements"),
			model: this.graphs.originalGraph
		});

        this.listenTo(this.papers.originalGraph, "cell:pointerdown", this.onDragStart);
        this.draggableGraph = new joint.dia.Graph;
        this.draggablePaper = new joint.dia.Paper({
            el: this.$(".draggable-paper"),
            width: 1,
            height: 1,
            model: this.draggableGraph
        });

        return this;
    },
    loadElements: function (elements) {
        this.graphs["originalGraph"].resetCells(elements);
    },
    onDragStart: function (element, mouseEvent) {
        this.$el.addClass("dragging");
        this.draggablePaper.$el.addClass("dragging");
        $(document.body).append(this.draggablePaper.$el);
        this.modelCopy = element.model.clone();
        this.elementCopyBox = element.getBBox();
        const offset = 5;
        const xPoint = this.elementCopyBox.x - this.modelCopy.get("position").x;
        const yPoint = this.elementCopyBox.y - this.modelCopy.get("position").y;
        const elementPoint = joint.g.point(xPoint, yPoint);

        this.modelCopy.set("position", {
            x: -elementPoint.x + offset,
            y: -elementPoint.y + offset
        });

        this.draggableGraph.addCell(this.modelCopy);
        this.draggablePaper.setDimensions(this.elementCopyBox.width + 2 * offset, this.elementCopyBox.height + 2 * offset);
        const scrollTopPosition = document.body.scrollTop || document.documentElement.scrollTop;

        this.draggablePaper.$el.offset({
            left: mouseEvent.clientX - this.elementCopyBox.width / 2,
            top: mouseEvent.clientY + scrollTopPosition - this.elementCopyBox.height / 2
        });
    },
    onDrag: function (mouseEvent) {
        const normalizedEvent = joint.util.normalizeEvent(mouseEvent);

        if (this.modelCopy) {
            const scrollTopPosition = document.body.scrollTop || document.documentElement.scrollTop;
            this.draggablePaper.$el.offset({
                left: normalizedEvent.clientX - this.elementCopyBox.width / 2,
                top: normalizedEvent.clientY + scrollTopPosition - this.elementCopyBox.height / 2
            });
        }
    },
    onDragEnd: function (mouseEvent) {
        const mouseUpEvent = joint.util.normalizeEvent(mouseEvent);
        if (this.modelCopy && this.elementCopyBox) {
            this.drop(mouseUpEvent, this.modelCopy.clone(), this.elementCopyBox);
            this.$el.append(this.draggablePaper.$el);
            this.$el.removeClass("dragging");
            this.draggablePaper.$el.removeClass("dragging");
            this.modelCopy.remove();
            this.modelCopy = false;
        }
    },
    drop: function (mouseUpEvent, droppedModel, modelDimensions) {
        const paper = this.options.paper;
        const scrollTopPos = document.body.scrollTop || document.documentElement.scrollTop;
        const scrollLeftPos = document.body.scrollLeft || document.documentElement.scrollLeft;
        const rectX = paper.$el.offset().left + parseInt(paper.$el.css("border-left-width"), 10) - scrollLeftPos;
        const rectY = paper.$el.offset().top + parseInt(paper.$el.css("border-top-width"), 10) - scrollTopPos;
        const rectWidth = paper.$el.innerWidth();
        const rectHeight = paper.$el.innerHeight();
        const rect = joint.g.rect(rectX, rectY, rectWidth, rectHeight);
        const paperTargetPoint = paper.svg.createSVGPoint();
        paperTargetPoint.x = mouseUpEvent.clientX;
        paperTargetPoint.y = mouseUpEvent.clientY;

        if (rect.containsPoint(paperTargetPoint)) {
            const fakeElement = joint.V("rect", {
                width: paper.options.width,
                height: paper.options.height,
                x: 0,
                y: 0,
                opacity: 0
            });
            joint.V(paper.svg).prepend(fakeElement);
            const paperOffset = $(paper.svg).offset();
            fakeElement.remove();
            paperTargetPoint.x += scrollLeftPos - paperOffset.left;
            paperTargetPoint.y += scrollTopPos - paperOffset.top;
            const targetPos = paperTargetPoint.matrixTransform(paper.viewport.getCTM().inverse());
            const droppedModelBox = droppedModel.getBBox();
            targetPos.x += droppedModelBox.x - modelDimensions.width / 2,
            targetPos.y += droppedModelBox.y - modelDimensions.height / 2,
            droppedModel.set("position", {
                x: joint.g.snapToGrid(targetPos.x, paper.options.gridSize),
                y: joint.g.snapToGrid(targetPos.y, paper.options.gridSize)
            });
            droppedModel.unset("z");
            this.options.graph.addCell(droppedModel, {
                xxx: this.cid
            });
        }
    }
}).bind(this);