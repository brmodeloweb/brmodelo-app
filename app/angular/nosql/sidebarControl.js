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
		customAttributes.push({
			name: $ctrl.newAttributeName,
			type: $ctrl.newAttributeType,
		});
		$ctrl.selectedElement.set("customAttributes", customAttributes);

		if (typeof $ctrl.selectedElement.updateTable === "function") {
			$ctrl.selectedElement.updateTable(customAttributes);
		}

		$ctrl.newAttributeName = "";
		$ctrl.newAttributeType = "";
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
			$ctrl.selectedElement =
				changes.selected.currentValue.model || changes.selected.currentValue;
		}
	};

	$ctrl.changeVisible = () => {
		$ctrl.visible = !$ctrl.visible;
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
		},
	}).name;
