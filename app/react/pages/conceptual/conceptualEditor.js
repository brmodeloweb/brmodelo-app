import { dia } from '@joint/core';
import { types } from "../../../editor/keyboardController";
import Editor from '../../../editor/editor';
import ShapePalette from '../../../editor/shapePalette';
import Factory from "./factory";
import note from "../../../joint/notes"
import erd from "../../../joint/shapes";
import Validator from "./validator";
import Linker from "./linker";
import EntityExtensor from "./entityExtensor";
import ToolsViewService from "../../../editor/toolsViewService";
import lineEndCircleIcon from "../../../img/editor/line-end-circle.svg";

export default class ConceptualEditor extends Editor {
	shapeFactory = null;
	shapeValidator = null;
	shapeLinker = null;
	entityExtensor = null;
	customActions = {};
	toolsViewService = null;
	selectedElementToolbar = null;
	selectedElementResizer = null;
	constructor(document, container, customActions = {}) {
		super(document, container, { selection: true, command: true, snaplines: true });
		this.customActions = customActions;
		this.shapeFactory = new Factory(erd);
		this.shapeValidator = new Validator(erd);
		this.shapeLinker = new Linker(this.shapeFactory, this.shapeValidator);
		this.entityExtensor = new EntityExtensor(this.shapeFactory, this.shapeValidator, this.shapeLinker);
		this.toolsViewService = new ToolsViewService();
		this.registerGraphEvents();
		this.registerCustomPaperEvents();
		this.registerShapePalette();
		this.registerCommandManager();
		this.registerCustomShortcuts();
		super.addPageBreaks();
	}

	registerCustomShortcuts() {
		const commands = [];
		if(this.customActions.saveModel) {
			commands.push({ shortcut: types.SAVE, action: () => this.customActions.saveModel() });
		}
		commands.push({ shortcut: types.ESC, action: () => {
			this.unselectAll();
		} });
		super.registerCustomShortcuts(commands);
	}

	registerGraphEvents() {
		super.registerGraphEvents();

		this.graph.on('add', (cell) => {
			if (cell instanceof dia.Link) return;
			if(this.shapeValidator.isAssociative(cell)) {
				this.makeAssociative(cell);
			}
		});

		this.graph.on('remove', () => {
			this.unselectAll();
		});
	}

	restrictEmbeddedElementMovement(element) {
		if(this.shapeValidator.isRelationshipFromBlockAssociative(element)) {
			const parentId = element.get('parent');
			if (!parentId) return;
			const parent = this.graph.getCell(parentId);
			parent.fitToChildren({padding: 10});
		}
	}

	onSelectElement(cellView) {
		if (cellView != null) {
			if (this.elementSelector != null) {
				this.elementSelector.collection.reset([]);
			}
			const elementType = this.selectElementType(cellView);
			this.customActions.selectElement({
				value: cellView.model.attributes?.attrs?.text?.text,
				type: elementType,
				element: cellView
			});
			return;
		}
		this.customActions.selectElement({
			value: "",
			type: "blank",
			element: null
		});
	}

	selectElementType(cellView) {
		if (cellView.model.isLink()) {
			return "Link";
		}
		if (this.shapeValidator.isBlockAssociative(cellView.model)) {
			return cellView.model.attributes.type;
		}
		return cellView.model.attributes.supertype;
	}

	unselectAll() {
		if (this.elementSelector != null) {
			this.elementSelector.collection.reset([]);
		}

		if(this.customActions.unselectAll) {
			this.customActions.unselectAll();
		}

		if (this.customActions.closeFeedback) {
			this.customActions.closeFeedback();
		}

		if (this.selectedElementToolbar != null) {
			this.selectedElementToolbar.remove();
		}

		if (this.selectedElementResizer != null) {
			this.selectedElementResizer.remove();
			this.selectedElementResizer = null;
		}
	}

	onUpdate = (event, selectedElement) => {
		this.setDirty(true);
		switch (event.type) {
			case 'name':
				selectedElement.element.model.setText(event.value, selectedElement.element);
				break;
			case 'extention':
				if (selectedElement.element.model.attributes.isExtended) {
					this.entityExtensor.updateExtension(selectedElement.element, event.value);
					selectedElement.element.update();
				} else {
					this.entityExtensor.createExtension(selectedElement.element, event.value);
				}
				break;
			case 'editExtention':
				selectedElement.element.model.setText(event.value, selectedElement.element);
				break;
			case 'addAutoRelationship':
				this.shapeLinker.addAutoRelationship(selectedElement);
				break;
			case 'link.cardinality':
				selectedElement.element.model.label(0,
					{
						position: 0.3,
						attrs: { text: { text: event.value } }
					});
				break;
			case 'link.role':
				selectedElement.element.model.label(1,
					{
						position: 0.7,
						attrs: { text: { text: event.value } }
					});
				break;
			case 'link.weak':
				selectedElement.element.model.setWeak(event.value, selectedElement.element);
				break;
			case 'attribute.cardinality':
				const newCardinality = event.value;
				let currentText = selectedElement.value.name;

				if(newCardinality != '(1, 1)'){
					currentText = currentText + " " + newCardinality;
				}

				selectedElement.element.model.attributes.cardinality = newCardinality;
				selectedElement.element.model.setText(currentText, selectedElement.element);
				break;
			case 'attribute.name':
				let newName = event.value;
				const currentCardinality = selectedElement.value.cardinality;
				if(currentCardinality != '(1, 1)'){
					newName = newName + " " + currentCardinality;
				}
				selectedElement.element.model.setText(newName, selectedElement.element);
				break;
			case 'attribute.composed':
				const newValue = event.value;
				const root = selectedElement.element.model;
				this.paper.freeze();
				try {
					if(newValue) {
						const rootX = root.attributes.position.x;
						const rootY = root.attributes.position.y;

						const attr1 = this.shapeFactory.createAttribute({ "position": { x: rootX + 50, y: rootY + 20 }});
						attr1.attributes.attrs.text.text = "attr1";

						this.graph.addCell(attr1);
						this.shapeLinker.createLink(root, attr1, this.graph);

						const attr2 = this.shapeFactory.createAttribute({ "position": { x: rootX + 50, y: rootY - 20 }});
						attr2.attributes.attrs.text.text = "attr2";

						this.graph.addCell(attr2);
						this.shapeLinker.createLink(root, attr2, this.graph);
					} else {
						this.graph.getNeighbors(root)
							.filter(neighbor => this.shapeValidator.isAttribute(neighbor))
							.forEach(neighbor => neighbor.remove());
					}
				} finally {
					this.paper.unfreeze();
				}
				break;
			case 'relationship.associative':
				const relationship = selectedElement.element.model;
				if(relationship.attributes.parent == null){
					const posX = relationship.attributes.position.x;
					const posY = relationship.attributes.position.y;
					const block = this.shapeFactory.createBlockAssociative({ "position": { x: posX, y: posY }, "size": { width: 105, height: 65 }});
					this.graph.addCell(block);
					relationship.setBlockAssociative();
					block.embed(relationship);
					relationship.toFront();
					block.fitToChildren({padding: 10});
				}
				break;
		}
	}

	registerCustomPaperEvents() {
		this.paper.on('link:options', (cellView) => {
			this.onSelectElement(cellView);
		});

		this.paper.on('element:pointerup', (cellView, evt) => {
			this.restrictEmbeddedElementMovement(cellView.model);

			if (evt.ctrlKey || evt.metaKey) {
				this.elementSelector.collection.add(cellView.model);
				return;
			}
			this.onSelectElement(cellView);
			this.activateElementToolbar(cellView);
		});

		this.paper.on('link:mouseenter', (linkView) => {
			const connectionType = this.shapeLinker.getConnectionTypeFromLink(linkView.model);
			const toolsView = this.toolsViewService.getToolsView(connectionType, "conceptual");
			linkView.addTools(toolsView);
		});

		this.paper.on('link:mouseleave', (linkView) => {
			linkView.removeTools();
		});

		this.paper.on('blank:pointerdown', () => {
			this.unselectAll();
		});

		this.paper.on('element:pointerdblclick', () => {
			if(this.customActions.openMenu) {
				this.customActions.openMenu();
			}
		});
	}

	activateElementToolbar(cellView) {
		if (this.selectedElementToolbar != null) {
			this.selectedElementToolbar.remove();
		}
		if (this.selectedElementResizer != null) {
			this.selectedElementResizer.remove();
			this.selectedElementResizer = null;
		}

		const toolbar = this.createDefaultElementToolbar(cellView);
		const shapeFactory = this.shapeFactory;
		toolbar.makeElement = function() {
			return [shapeFactory.createAttribute({
				attrs: {
					text: { text: 'Attribute' }
				}
			})];
		}

		if (this.shapeValidator.isRelationshipFromBlockAssociative(cellView.model)){
			toolbar.removeHandle('remove');
		}

		if (this.shapeValidator.isEntity(cellView.model)) {
			toolbar.addHandle({ name: 'fork', icon: lineEndCircleIcon });
		}

		toolbar.on('action:link:add', (link) => {
			this.shapeLinker.onLink(link, this.paper);
		});

		this.selectedElementToolbar = toolbar;
		toolbar.render();

		if (this.isResizable(cellView)) {
			const elementResizer = this.createElementResizer(cellView);

			elementResizer.on('resize:stop', () => {
				if(this.shapeValidator.isRelationshipFromBlockAssociative(cellView.model)) {
					cellView.model.fitParent({padding: 10});
				}
			});

			this.selectedElementResizer = elementResizer;
		}
	}

	isResizable(cellView) {
		return !this.shapeValidator.isAttribute(cellView.model)
			&& !this.shapeValidator.isExtension(cellView.model)
			&& !this.shapeValidator.isKey(cellView.model);
	}

	registerShapePalette() {
		const shapePalette = new ShapePalette({
			paper: this.paper,
			width: 132,
			height: 400
		});

		shapePalette.render();
		this.document.getElementById('shape-palette').appendChild(shapePalette.el);

		shapePalette.load([
			this.shapeFactory.createEntity({ position: { x: 25, y: 10 } }),
			this.shapeFactory.createRelationship({ position: { x: 25, y: 70 } }),
			this.shapeFactory.createAssociative({ position: { x: 15, y: 135 } }),
			this.shapeFactory.createAttribute({ position: { x: 65, y: 225 } }),
			this.shapeFactory.createKey({ position: { x: 65, y: 270 } }),
			new note.Note({ position: { x: 25, y: 300 } })
		]);
	}

	makeAssociative(model) {
		const posX = model.attributes.position.x;
		const posY = model.attributes.position.y;
		this.paper.freeze();
		try {
			const block = this.shapeFactory.createBlockAssociative({ "position": { x: posX, y: posY }, "size": { width: 105, height: 65 }});
			const auto = this.shapeFactory.createRelationship({ "position": { x: posX + 10, y: posY + 10 }});
			auto.setBlockAssociative();
			block.embed(auto);
			this.graph.addCells([block, auto]);
		} finally {
			this.paper.unfreeze();
		}
		setTimeout(() => {
			model.remove();
		}, 200);
	}

}