import "backbone";
import $ from "jquery";

import * as joint from "jointjs/dist/joint";

import "../editor/editorManager";
import "../editor/editorScroller";
import "../editor/editorActions";
import "../editor/elementActions";
import "../editor/elementSelector";

import nosql from "../../joint/shapesNosql";
joint.shapes.nosql = nosql;

import angular from "angular";
import template from "./nosql.html";

import modelDuplicatorComponent from "../components/duplicateModelModal";
import shareModelModal from "../components/shareModelModal";
import statusBar from "../components/statusBar";

import KeyboardController, { types } from "../components/keyboardController";
import ToolsViewService from "../service/toolsViewService";
import preventExitServiceModule from "../service/preventExitService";
import iconConceptual from "../components/icons/conceptual";
import supportBannersList from "../components/supportBannersList";
import { realignMutualExclusionChildren } from "../../joint/shapesNosql";
const controller = function (
	ModelAPI,
	$stateParams,
	$rootScope,
	$timeout,
	$uibModal,
	$state,
	$transitions,
	preventExitService,
	$filter,
) {
	const ctrl = this;
	ctrl.modelState = {
		isDirty: false,
		updatedAt: new Date(),
	};
	ctrl.feedback = {
		message: "",
		showing: false,
	};
	ctrl.loading = true;
	ctrl.model = {
		id: "",
		name: "",
		type: "conceptual",
		model: "",
		user: $rootScope.loggeduser,
	};
	ctrl.selectedElement = {};
	const configs = {
		graph: {},
		paper: {},
		editorActions: {},
		keyboardController: null,
		selectedElementActions: null,
	};
	let selectedContainers = [];

	const setIsDirty = (isDirty) => {
		ctrl.modelState.isDirty = isDirty;
	};

	ctrl.setLoading = (show) => {
		$timeout(() => {
			ctrl.loading = show;
		});
	};

	ctrl.showFeedback = (show, newMessage) => {
		$timeout(() => {
			ctrl.feedback.showing = show;
			ctrl.feedback.message = $filter("translate")(newMessage);
		});
	};

	ctrl.saveModel = () => {
		ctrl.modelState.updatedAt = new Date();
		setIsDirty(false);
		ctrl.setLoading(true);
		ctrl.model.model = JSON.stringify(configs.graph);
		ModelAPI.updateModel(ctrl.model).then(function (res) {
			ctrl.showFeedback(true, "Successfully saved!");
			ctrl.setLoading(false);
		});
	};

	ctrl.print = () => {
		window.print();
	};

	ctrl.undoModel = () => {
		configs.editorActions.undo();
	};

	ctrl.redoModel = () => {
		configs.editorActions.redo();
	};

	ctrl.zoomIn = () => {
		configs.editorScroller.zoom(0.1, { max: 2 });
	};

	ctrl.zoomOut = () => {
		configs.editorScroller.zoom(-0.1, { min: 0.2 });
	};

	ctrl.zoomNone = () => {
		configs.editorScroller.zoom();
	};

	ctrl.duplicateModel = (model) => {
		const modalInstance = $uibModal.open({
			animation: true,
			template:
				'<duplicate-model-modal suggested-name="$ctrl.suggestedName" close="$close(result)" dismiss="$dismiss(reason)"></duplicate-model-modal>',
			controller: function () {
				const $ctrl = this;
				$ctrl.suggestedName = $filter("translate")("MODEL_NAME (copy)", {
					name: model.name,
				});
			},
			controllerAs: "$ctrl",
		});
		modalInstance.result.then((newName) => {
			ctrl.setLoading(true);
			const duplicatedModel = {
				id: "",
				name: newName,
				type: model.type,
				model: model.model,
				user: model.who,
			};
			ModelAPI.saveModel(duplicatedModel).then((newModel) => {
				window.open($state.href("conceptual", { modelid: newModel._id }));
				ctrl.showFeedback(true, "Successfully duplicated!");
				ctrl.setLoading(false);
			});
		});
	};

	ctrl.duplicateModel = (model) => {
		const modalInstance = $uibModal.open({
			animation: true,
			template: `<duplicate-model-modal
						suggested-name="$ctrl.suggestedName"
						close="$close(result)"
						dismiss="$dismiss(reason)"
						user-id=$ctrl.userId
						model-id=$ctrl.modelId>
					</duplicate-model-modal>`,
			controller: function () {
				const $ctrl = this;
				$ctrl.suggestedName = $filter("translate")("MODEL_NAME (copy)", {
					name: model.name,
				});
				$ctrl.modelId = model._id;
				$ctrl.userId = model.who;
			},
			controllerAs: "$ctrl",
		}).result;
		modalInstance
			.then((newModel) => {
				window.open(
					$state.href("logic", { references: { modelid: newModel._id } }),
				);
				ctrl.showFeedback(true, "Successfully duplicated!");
			})
			.catch((error) => {
				console.error(error);
			});
	};

	ctrl.convertModel = (conceptualModel) => {
		const model = {
			name: conceptualModel.name + $filter("translate")("_converted"),
			user: $rootScope.loggeduser,
			type: "logic",
			model: '{"cells":[]}',
		};
		ModelAPI.saveModel(model).then((newModel) => {
			window.open(
				$state.href("logic", {
					references: {
						modelid: newModel._id,
						conversionId: conceptualModel._id,
					},
				}),
				"_blank",
			);
		});
	};

	ctrl.shareModel = (model) => {
		const modalInstance = $uibModal.open({
			animation: true,
			backdrop: "static",
			keyboard: false,
			template:
				'<share-model-modal close="$close(result)" dismiss="$dismiss()" model-id="$ctrl.modelId"></share-model-modal>',
			controller: function () {
				const $ctrl = this;
				$ctrl.modelId = model._id;
			},
			controllerAs: "$ctrl",
		}).result;
		modalInstance
			.then(() => {
				ctrl.showFeedback(
					true,
					$filter("translate")(
						"Sharing configuration has been updated successfully!",
					),
				);
			})
			.catch((reason) => {
				console.log("Modal dismissed with reason", reason);
			});
	};

	ctrl.unselectAll = () => {
		ctrl.showFeedback(false, "");
		ctrl.onSelectElement(null);
		if (configs.selectedElementActions != null) {
			configs.selectedElementActions.remove();
			configs.selectedElementActions = null;
		}
	};

	ctrl.onUpdate = (event) => {
		if (event.type == "name") {
			ctrl.selectedElement.element.model.updateName(event.value);
		}
	};

	const registerPaperEvents = (paper) => {
		paper.on("blank:pointerdown", (evt) => {
			ctrl.unselectAll();
			if (!configs.keyboardController.spacePressed) {
				configs.elementSelector.start(evt);
			} else {
				configs.editorScroller.startPanning(evt);
			}
			configs.elementSelector.setCopyContext(evt);
		});

		paper.on("link:options", (cellView) => {
			ctrl.onSelectElement(cellView);
		});

		paper.on("element:pointerup", (cellView, evt, x, y) => {
			ctrl.onSelectElement(cellView);

			const elementActions = new joint.ui.ElementActions({
				cellView: cellView,
				boxContent: false,
			});

			configs.selectedElementActions = elementActions;
			elementActions.on("action:link:add", function (link) {});

			elementActions.render();
		});

		// paper.on("element:mouseover", function (cellView) {
		// 	const parents = configs.graph.findModelsUnderElement(cellView.model);

		// 	if (parents.length > 0) {
		// 		const targetParent = parents[parents.length - 1];
		// 		const alreadyEmbedded = configs.graph.getElements().some((el) => {
		// 			const embeds = el.get("embeds");
		// 			if (Array.isArray(embeds)) {
		// 				return embeds.includes(cellView.model.id);
		// 			}
		// 			return false;
		// 		});

		// 		if (!alreadyEmbedded) {
		// 			targetParent.embed(cellView.model);

		// 			if (targetParent.realignChildrenInGrid)
		// 				targetParent.realignChildrenInGrid();

		// 			if (cellView.model.realignChildrenInGrid)
		// 				cellView.model.realignChildrenInGrid();
		// 		}
		// 	}
		// });
		// paper.on("element:mouseover", function (cellView) {
		// 	const parents = configs.graph.findModelsUnderElement(cellView.model);

		// 	if (parents.length > 0) {
		// 		const targetParent = parents[parents.length - 1];
		// 		const alreadyEmbedded = configs.graph.getElements().some((el) => {
		// 			const embeds = el.get("embeds");
		// 			if (Array.isArray(embeds)) {
		// 				return embeds.includes(cellView.model.id);
		// 			}
		// 			return false;
		// 		});

		// 		if (!alreadyEmbedded) {
		// 			targetParent.embed(cellView.model);

		// 			if (typeof targetParent.realignChildrenInGrid === "function") {
		// 				targetParent.realignChildrenInGrid();
		// 			}

		// 			// Se quiser garantir que os ancestrais também se reajustem:
		// 			if (typeof targetParent.resizeAncestorsToFit === "function") {
		// 				targetParent.resizeAncestorsToFit(10);
		// 			}
		// 		}
		// 	}
		// });

		// paper.on("element:mouseover", function (cellView) {
		// 	const model = cellView.model;
		// 	const parents = configs.graph.findModelsUnderElement(model);

		// 	if (parents.length > 0) {
		// 		const parent = parents[parents.length - 1];
		// 		const alreadyEmbedded = parent.get("embeds")?.includes(model.id);

		// 		if (!alreadyEmbedded) {
		// 			if (parent.get("isMutualExclusionParent")) {
		// 				embedMutualExclusionChild(parent, model, 10);
		// 			} else {
		// 				parent.embed(model);
		// 				if (typeof parent.realignChildrenInGrid === "function") {
		// 					parent.realignChildrenInGrid();
		// 				}
		// 			}

		// 			if (typeof parent.resizeAncestorsToFit === "function") {
		// 				parent.resizeAncestorsToFit(10);
		// 			}
		// 		}
		// 	}
		// });

		// paper.on("element:mouseover", function (cellView) {
		// 	const model = cellView.model;
		// 	const parents = configs.graph.findModelsUnderElement(model);

		// 	if (parents.length > 0) {
		// 		const parent = parents[parents.length - 1];
		// 		const alreadyEmbedded = parent.get("embeds")?.includes(model.id);

		// 		if (!alreadyEmbedded) {
		// 			embedChildBelowTable(parent, model);

		// 			if (typeof parent.updateTable === "function") {
		// 				parent.updateTable(parent.get("customAttributes") || []);
		// 			}
		// 			if (typeof parent.resizeAncestorsToFit === "function") {
		// 				parent.resizeAncestorsToFit(10);
		// 			}
		// 		}
		// 	}
		// });

		// paper.on("element:mouseover", function (cellView) {
		// 	const model = cellView.model;
		// 	const parents = configs.graph.findModelsUnderElement(model);

		// 	console.log("==== Evento: element:mouseover ====");
		// 	console.log("Model ID:", model.id);
		// 	console.log(
		// 		"Parents encontrados:",
		// 		parents.map((p) => p.id),
		// 	);
		// 	console.log("Model.get('parent'):", model.get("parent"));

		// 	// Regra: Se o model já tem parent, BLOQUEIA
		// 	if (hasAnyParent(model)) {
		// 		console.log("🚫 BLOQUEADO: Model já é filho (não pode receber embeds)");
		// 		return;
		// 	}

		// 	if (parents.length > 0) {
		// 		const parent = parents[parents.length - 1];
		// 		// Se o parent também já tem parent, BLOQUEIA
		// 		if (hasAnyParent(parent)) {
		// 			console.log(
		// 				"🚫 BLOQUEADO: Parent já é filho, não pode ser pai de mais nada.",
		// 			);
		// 			return;
		// 		}

		// 		const alreadyEmbedded = parent.get("embeds")?.includes(model.id);

		// 		if (!alreadyEmbedded) {
		// 			console.log("✅ EMBED: parent:", parent.id, "model:", model.id);
		// 			parent.embed(model);

		// 			if (typeof parent.updateTable === "function") {
		// 				parent.updateTable(parent.get("customAttributes") || []);
		// 			}
		// 			if (typeof parent.resizeAncestorsToFit === "function") {
		// 				parent.resizeAncestorsToFit(10);
		// 			}
		// 		} else {
		// 			console.log("ℹ️ Já está embedado:", model.id, "em", parent.id);
		// 		}
		// 	}
		// });
		///////////////////////////////////////ta funfando bem, porem nao consegue embedar filho de filho
		// paper.on("element:mouseover", function (cellView) {
		// 	const model = cellView.model;
		// 	const graph = configs.graph;
		// 	const parents = graph.findModelsUnderElement(model);

		// 	console.log("==== Evento: element:mouseover ====");
		// 	console.log(
		// 		"Model (arrastando):",
		// 		model.id,
		// 		"parent:",
		// 		model.get("parent"),
		// 		"embeds:",
		// 		model.get("embeds"),
		// 	);

		// 	if (model.get("parent")) {
		// 		console.log("🚫 Model já é filho, não pode ser embedado.");
		// 		return;
		// 	}
		// 	if ((model.get("embeds") || []).length > 0) {
		// 		console.log("🚫 Model já é PAI de alguém, não pode virar filho!");
		// 		return;
		// 	}

		// 	if (parents.length > 0) {
		// 		const parent = parents[parents.length - 1];
		// 		console.log("Tentativa de embed:");
		// 		console.log(
		// 			"Parent candidato:",
		// 			parent.id,
		// 			"parent.get('parent'):",
		// 			parent.get("parent"),
		// 			"embeds:",
		// 			parent.get("embeds"),
		// 		);

		// 		// Parent não pode ser filho de ninguém
		// 		if (parent.get("parent")) {
		// 			console.log(
		// 				"🚫 BLOQUEADO: Parent já é filho, não pode receber embeds.",
		// 			);
		// 			return;
		// 		}
		// 		// Parent não pode ser o próprio model
		// 		if (parent.id === model.id) {
		// 			console.log("🚫 BLOQUEADO: Parent é o próprio model.");
		// 			return;
		// 		}
		// 		// Parent não pode ser descendente do model
		// 		if (isDescendant(parent, model, graph)) {
		// 			console.log(
		// 				"🚫 BLOQUEADO: Parent é descendente do model (tentativa de ciclo).",
		// 			);
		// 			return;
		// 		}

		// 		const alreadyEmbedded = parent.get("embeds")?.includes(model.id);
		// 		if (!alreadyEmbedded) {
		// 			embedChildBelowTable(parent, model);

		// 			if (typeof parent.updateTable === "function") {
		// 				parent.updateTable(parent.get("customAttributes") || []);
		// 			}
		// 			if (typeof parent.resizeAncestorsToFit === "function") {
		// 				parent.resizeAncestorsToFit(10);
		// 			}
		// 			console.log(
		// 				"✅ Embed + alinhamento realizado:",
		// 				parent.id,
		// 				"->",
		// 				model.id,
		// 			);

		// 			setTimeout(() => {
		// 				console.log("Após embed:");
		// 				console.log("Parent:", parent.id, "embeds:", parent.get("embeds"));
		// 				console.log(
		// 					"Model:",
		// 					model.id,
		// 					"parent:",
		// 					model.get("parent"),
		// 					"embeds:",
		// 					model.get("embeds"),
		// 				);
		// 			}, 100);
		// 		} else {
		// 			console.log("ℹ️ Já está embedado:", model.id, "em", parent.id);
		// 		}
		// 	}
		// });

		paper.on("element:mouseover", function (cellView) {
			const model = cellView.model;
			const graph = configs.graph;
			const parents = graph.findModelsUnderElement(model);

			if (parents.length > 0) {
				const parent = parents[parents.length - 1];

				// ... suas regras de bloqueio ...

				// Só faz embed SE for de fato um novo embed
				const currentParentId = model.get("parent");
				if (currentParentId !== parent.id) {
					// Remove do parent anterior se necessário
					if (currentParentId) {
						const currentParent = graph.getCell(currentParentId);
						if (currentParent) currentParent.unembed(model);
					}
					// Faz o embed
					parent.embed(model);

					// 🔄 Só aqui faz o alinhamento!
					if (parent.attributes.customAttributes.length > 0) {
						console.log("entrou em update");
						parent.updateTable(parent.get("customAttributes") || []);
					}
					// if (typeof parent.resizeAncestorsToFit === "function") {
					else {
						// parent.resizeAncestorsToFit(10);
						parent.realignChildrenInGrid();
					}
					// }
					// if (typeof parent.fit === "function") {
					// 	parent.fit();
					// }
				}
				// Se não houve embed, NÃO faz alinhamento!
			}
		});
		paper.on("element:pointerdblclick", () => {
			$rootScope.$broadcast("command:openmenu");
		});

		configs.paper.on("link:mouseenter", (linkView) => {
			const conectionType = ctrl.shapeLinker.getConnectionTypeFromLink(
				linkView.model,
			);
			const toolsView = ctrl.toolsViewService.getToolsView(conectionType);
			linkView.addTools(toolsView);
		});

		configs.paper.on("link:mouseleave", (linkView) => {
			linkView.removeTools();
		});
		paper.on("element:pointerdown", function (cellView, evt) {
			if (cellView.model.attributes.supertype === "Collection") {
				if (evt.ctrlKey) {
					if (!selectedContainers.includes(cellView.model)) {
						selectedContainers.push(cellView.model);
						cellView.highlight("body");
					} else {
						selectedContainers = selectedContainers.filter(
							(c) => c !== cellView.model,
						);
						cellView.unhighlight("body");
					}
				} else {
					selectedContainers.forEach((c) => {
						const view = configs.paper.findViewByModel(c);
						if (view && typeof view.unhighlight === "function") {
							view.unhighlight("body");
						}
					});
					selectedContainers = [cellView.model];
					cellView.highlight("body");
				}
			}
		});
	};

	$("#mutualExclusionBtn").on("click", function () {
		console.log("Cliquei na chave!", selectedContainers);
		if (selectedContainers.length < 2) {
			alert("Selecione pelo menos dois containers para unir!");
			return;
		}

		nosql.createMutualExclusionBrace(selectedContainers, configs.graph);

		const allCells = configs.graph.getCells();
		const parentContainer = allCells.find((cell) => {
			return selectedContainers.every((child) =>
				cell.getEmbeddedCells().includes(child),
			);
		});

		if (parentContainer) {
			parentContainer.set("isMutualExclusionParent", true);
		} else {
			console.warn("Anyone parent found to mutual exclusion.");
		}
		selectedContainers.forEach((cell) =>
			configs.paper.findViewByModel(cell).unhighlight("body"),
		);
		selectedContainers = [];
	});
	const registerShortcuts = () => {
		configs.keyboardController.registerHandler(types.SAVE, () =>
			ctrl.saveModel(),
		);
		configs.keyboardController.registerHandler(types.UNDO, () =>
			ctrl.undoModel(),
		);
		configs.keyboardController.registerHandler(types.REDO, () =>
			ctrl.redoModel(),
		);
		configs.keyboardController.registerHandler(types.ZOOM_IN, () =>
			ctrl.zoomIn(),
		);
		configs.keyboardController.registerHandler(types.ZOOM_OUT, () =>
			ctrl.zoomOut(),
		);
		configs.keyboardController.registerHandler(types.ZOOM_NONE, () =>
			ctrl.zoomNone(),
		);
		configs.keyboardController.registerHandler(types.ESC, () =>
			ctrl.unselectAll(),
		);
		configs.keyboardController.registerHandler(types.COPY, () =>
			configs.elementSelector.copyAll(),
		);
		configs.keyboardController.registerHandler(types.PASTE, () =>
			configs.elementSelector.pasteAll(),
		);
		configs.keyboardController.registerHandler(types.DELETE, () =>
			configs.elementSelector.deleteAll(),
		);
	};
	function embedChildBelowTable(parent, child) {
		// 1. Calcule onde termina a tabela
		const attrsCount = parent.get("customAttributes")?.length || 0;
		const cellHeight = 30;
		const baseTableY = 30;
		const bgHeight = (attrsCount + 1) * cellHeight;
		const tableBottom = baseTableY + bgHeight + 20; // 20 de padding opcional

		const parentPos = parent.position();

		const children = parent.getEmbeddedCells ? parent.getEmbeddedCells() : [];
		const realChildren = children.filter((c) => c.id !== parent.id);
		const childIndex = realChildren.length;
		const childX = parentPos.x + 50;
		const childY =
			parentPos.y + tableBottom + 10 + childIndex * (child.size().height + 10);

		child.position(childX, childY);
		parent.embed(child);

		const childBottom = childY + child.size().height;
		const minHeight = childBottom - parentPos.y + 10;
		const tableHeight = tableBottom - parentPos.y + 10;
		parent.resize(parent.size().width, Math.max(tableHeight, minHeight));
	}
	const registerGraphEvents = (graph) => {
		graph.on("change", () => {
			setIsDirty(true);
		});

		graph.on("remove", () => {
			setIsDirty(true);
		});

		graph.on("change:position", function (cell) {});

		graph.on("add", (model) => {
			setIsDirty(true);
			if (model instanceof joint.dia.Link) return;
		});
	};

	const buildWorkspace = () => {
		configs.graph = new joint.dia.Graph({}, { cellNamespace: joint.shapes });

		registerGraphEvents(configs.graph);

		const content = $("#content");

		configs.paper = new joint.dia.Paper({
			width: content.width(),
			height: content.height(),
			gridSize: 10,
			drawGrid: true,
			model: configs.graph,
			linkConnectionPoint: joint.util.shapePerimeterConnectionPoint,
			cellViewNamespace: joint.shapes,
			linkPinning: false,
			views: {
				"nosql.Collection": joint.shapes.custom.ContainerView,
			},
		});
		ctrl.paper = configs.paper;
		ctrl.onSelectElement = (cellView) => {
			if (cellView != null) {
				configs.elementSelector.cancel();
				$timeout(() => {
					cellView.model.toFront({ deep: true });
					ctrl.selectedElement = {
						model: cellView.model,
						value: cellView.model.attributes?.attrs?.headerText?.text,
						type: cellView.model.attributes.supertype,
						element: cellView,
					};
				});
				return;
			}

			$timeout(() => {
				ctrl.selectedElement = {
					value: "",
					type: "blank",
					element: null,
				};
			});
		};
		configs.keyboardController = new KeyboardController(
			configs.paper.$document,
		);

		registerPaperEvents(configs.paper);

		configs.editorScroller = new joint.ui.EditorScroller({
			paper: configs.paper,
			cursor: "grabbing",
			autoResizePaper: true,
		});
		content.append(configs.editorScroller.render().el);

		const enditorManager = new joint.ui.EditorManager({
			graph: configs.graph,
			paper: configs.paper,
		});

		configs.editorActions = new joint.ui.EditorActions({
			graph: configs.graph,
			paper: configs.paper,
		});

		$(".elements-holder").append(enditorManager.render().el);

		configs.elementSelector = new joint.ui.ElementSelector({
			paper: configs.paper,
			graph: configs.graph,
			model: new Backbone.Collection(),
		});

		const containerParent = new joint.shapes.nosql.Collection({
			size: { width: 100, height: 100 },
			z: 1,
			position: { x: 10, y: 10 },
			attrs: {
				headerText: { text: "Coleção" },
				customText: { text: "" },
			},
			customAttributes: [],
		});
		enditorManager.loadElements([containerParent]);

		registerShortcuts();
	};

	ctrl.$postLink = () => {
		buildWorkspace();
	};
	ctrl.addAttributeHandler = function (args) {
		const attributeName = args.name;
		const attributeType = args.type;
		const element = args.element;
		if (!attributeName || !attributeType || !element) {
			console.warn("Incomplete data");
			return;
		}
		const customAttributes = element.get("customAttributes") || [];
		customAttributes.push({ name: attributeName, type: attributeType });
		element.set("customAttributes", customAttributes);

		if (typeof element.updateTable === "function") {
			element.updateTable(customAttributes);
		} else {
			console.warn("updateTable doesn't exists!", element);
		}

		if (configs.paper && configs.paper.draw) configs.paper.draw();

		ctrl.newAttributeName = "";
		ctrl.newAttributeType = "";
	};
	ctrl.$onInit = () => {
		ctrl.toolsViewService = new ToolsViewService();
		ctrl.setLoading(true);

		ModelAPI.getModel($stateParams.modelid, $rootScope.loggeduser)
			.then((resp) => {
				const jsonModel =
					typeof resp.data.model === "string"
						? JSON.parse(resp.data.model)
						: resp.data.model;

				ctrl.model = resp.data;
				ctrl.model.id = resp.data._id;
				ctrl.model.model = jsonModel;

				configs.graph.fromJSON(jsonModel);
				const selectedId = ctrl.selectedElement?.model?.id;

				ctrl.graph = configs.graph;

				if (selectedId) {
					const realElement = ctrl.graph.getCell(selectedId);
					if (realElement) {
						ctrl.selectedElement.model = realElement;
						const customAttributes = realElement.get("customAttributes") || [];
						const allAttributeNames = customAttributes
							.map((attr) => attr.name)
							.join(", ");
						realElement.attr("customText/text", allAttributeNames);
					} else {
						console.warn("Element with ID", selectedId, "not found in graph.");
					}
				}
				ctrl.setLoading(false);
			})
			.catch((error) => {
				if (error.status === 404 || error.status === 401) {
					$state.go("noaccess");
				}
				console.error(error);

				ctrl.setLoading(false);
			});
	};
	window.onbeforeunload = preventExitService.handleBeforeUnload(ctrl);
	const onBeforeDeregister = $transitions.onBefore(
		{},
		preventExitService.handleTransitionStart(ctrl, "conceptual"),
	);
	const onExitDeregister = $transitions.onExit(
		{},
		preventExitService.cleanup(ctrl),
	);

	ctrl.$onDestroy = () => {
		configs.graph = null;
		configs.paper = null;
		configs.keyboardController.unbindAll();
		configs.keyboardController = null;
		preventExitService.cleanup(ctrl)();
		onBeforeDeregister();
		onExitDeregister();
	};
};

export default angular
	.module("app.workspace.nosql", [
		modelDuplicatorComponent,
		preventExitServiceModule,
		statusBar,
		shareModelModal,
		iconConceptual,
		supportBannersList,
	])
	.component("editorNoSQL", {
		template,
		controller,
	}).name;
