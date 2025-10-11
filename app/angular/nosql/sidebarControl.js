import angular from "angular";
import template from "./sidebarControl.html";

const configurator = () => {
	const configuration = {
		emptyState: false,
		collection: false,
	};

	const emptyState = () => {
		configuration.emptyState = true;
		return configuration;
	};

	const select = (element) => {
		switch (element.type) {
			case "Collection":
				configuration.collection = true;
				return configuration;
			default:
				break;
		}

		return emptyState();
	};

	return {
		emptyState,
		select,
	};
};

const controller = function ($rootScope, $timeout) {
	const $ctrl = this;
	$ctrl.visible = true;
	$ctrl.selectedElement = {};

	$rootScope.$on("command:openmenu", () => {
		$timeout(() => {
			$ctrl.visible = true;
		});
	});

	$ctrl.$onInit = () => {
		$ctrl.configuration = configurator().emptyState();
	};

	$ctrl.updateName = (newName) => {
		if (newName != "") {
			$ctrl.onUpdate({
				event: {
					type: "name",
					value: newName,
				},
			});
		}
	};

	$ctrl.newAttributeName = "";
	$ctrl.newAttributeType = "";

	$ctrl.addAttribute = function () {
		if (
			!$ctrl.newAttributeName ||
			!$ctrl.newAttributeType ||
			!$ctrl.selectedElement ||
			typeof $ctrl.selectedElement.get !== "function"
		) {
			console.warn("Nome/tipo vazio ou seleção inválida.");
			return;
		}

		var customAttributes = $ctrl.selectedElement.get("customAttributes") || [];
		let newAttr = {
			name: $ctrl.newAttributeName,
			type: $ctrl.newAttributeType,
		};
		if ($ctrl.newAttributeCardinalityEnabled) {
			newAttr.cardinalityEnabled = true;
			newAttr.minCardinality = $ctrl.newAttributeMinCardinality;
			newAttr.maxCardinality = $ctrl.newAttributeMaxCardinality;
		}
		customAttributes.push(newAttr);

		$ctrl.selectedElement.set("customAttributes", customAttributes);

		if (typeof $ctrl.selectedElement.updateTable === "function") {
			$ctrl.selectedElement.updateTable(customAttributes);
		}

		$ctrl.newAttributeName = "";
		$ctrl.newAttributeType = "";
		$ctrl.newAttributeCardinalityEnabled = false;
		$ctrl.newAttributeMinCardinality = null;
		$ctrl.newAttributeMaxCardinality = null;
	};

	$ctrl.updateAttributeName = function (index, newName) {
		if (
			!$ctrl.selectedElement ||
			typeof $ctrl.selectedElement.get !== "function"
		)
			return;
		var customAttributes = $ctrl.selectedElement.get("customAttributes") || [];
		customAttributes[index].name = newName;
		$ctrl.selectedElement.set("customAttributes", customAttributes);
		$ctrl.syncAttributes();
	};

	$ctrl.updateAttributeType = function (index, newType) {
		if (
			!$ctrl.selectedElement ||
			typeof $ctrl.selectedElement.get !== "function"
		)
			return;
		var customAttributes = $ctrl.selectedElement.get("customAttributes") || [];
		customAttributes[index].type = newType;
		$ctrl.selectedElement.set("customAttributes", customAttributes);
		$ctrl.syncAttributes();
	};

	$ctrl.removeAttribute = function (index) {
		if (
			!$ctrl.selectedElement ||
			typeof $ctrl.selectedElement.get !== "function"
		)
			return;
		var customAttributes = $ctrl.selectedElement.get("customAttributes") || [];
		var newCustomAttributes = customAttributes.filter((_, i) => i !== index);
		$ctrl.selectedElement.set("customAttributes", newCustomAttributes);
		if (typeof $ctrl.selectedElement.updateTable === "function") {
			$ctrl.selectedElement.updateTable(newCustomAttributes);
		}
	};
	$ctrl.syncAttributes = function () {
		if (
			$ctrl.selectedElement &&
			typeof $ctrl.selectedElement.updateTable === "function"
		) {
			$ctrl.selectedElement.updateTable($ctrl.getCustomAttributes());
		}
	};

	$ctrl.getCustomAttributes = function () {
		if (
			$ctrl.selectedElement &&
			typeof $ctrl.selectedElement.get === "function"
		) {
			return $ctrl.selectedElement.get("customAttributes") || [];
		}
		return [];
	};

	const customSelector = (selected) => {
		return selected.currentValue;
	};

	$ctrl.$onChanges = (changes) => {
		if (changes.selected && changes.selected.currentValue) {
			$ctrl.configuration = configurator().select(
				changes.selected.currentValue,
			);
			const selected =
				changes.selected.currentValue.model || changes.selected.currentValue;
			$ctrl.selectedElement = selected;
		}
	};

	$ctrl.changeVisible = () => {
		$ctrl.visible = !$ctrl.visible;
	};

	$ctrl.hasMultipleSelection = function () {

		return $ctrl.selectedContainers && $ctrl.selectedContainers.length > 1;
	};

	$ctrl.updateCollectionCardinality = function () {
		const el = $ctrl.selectedElement;
		const jointShape = el.jointElement || el;
		if (jointShape && typeof jointShape.set === "function") {
			jointShape.set("cardinalityEnabled", el.cardinalityEnabled); // ← ESSENCIAL!
			if (el.cardinalityEnabled) {
				jointShape.set("minCardinality", el.minCardinality ?? 0);
				jointShape.set("maxCardinality", el.maxCardinality || "N");
			} else {
				jointShape.set("minCardinality", undefined);
				jointShape.set("maxCardinality", undefined);
			}
			jointShape.updateTable(jointShape.get("customAttributes") || []);
		}
	};

	$ctrl.updateAttributeCardinality = function (index) {
		const attrs = $ctrl.getCustomAttributes();
		const attr = attrs[index];
		const jointShape =
			$ctrl.selectedElement.jointElement || $ctrl.selectedElement;
		if (jointShape && typeof jointShape.set === "function") {
			if (!attr.cardinalityEnabled) {

				attr.minCardinality = undefined;
				attr.maxCardinality = undefined;
			} else {

				attr.minCardinality = attr.minCardinality ?? 0;
				attr.maxCardinality =
					attr.maxCardinality === "" ? "N" : attr.maxCardinality;
			}
			jointShape.set("customAttributes", attrs);
			jointShape.updateTable(attrs);
		}
	};
};
export default angular
	.module("app.workspace.nosql.sidebar", [])
	.component("sidebarControlNosql", {
		template,
		controller,
		bindings: {
			selected: "<",
			onUpdate: "&",
			addAttributeHandler: "&",
			createMutualExclusionBrace: "&",
			selectedContainers: "<",
		},
	}).name;
