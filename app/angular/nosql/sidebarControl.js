import angular from "angular";
import template from "./sidebarControl.html";

const configurator = () => {

	const configuration = {
		"emptyState": false,
		"collection": false
	}

	const emptyState = () => {
		configuration.emptyState = true;
		return configuration;
	}

	const select = (element) => {
		switch (element.type) {
			case "Collection":
				configuration.collection = true;
				return configuration;
			default:
				break;
		}

		return emptyState();
	}

	return {
		emptyState,
		select
	}
}


const controller = function($rootScope, $timeout) {
	const $ctrl = this;
	$ctrl.visible = true;
	$ctrl.selectedElement = {}

	$rootScope.$on('command:openmenu', () => {
		$timeout(() => {
			$ctrl.visible = true;
		});
	});

	$ctrl.$onInit = () => {
		$ctrl.configuration = configurator().emptyState();
	}

	$ctrl.updateName = (newName) => {
		if (newName != "") {
			$ctrl.onUpdate({
				"event": {
					"type": "name",
					"value": newName
				}
			});
		}
	}

	const customSelector = (selected) => {
		return selected.currentValue;
	}

	$ctrl.$onChanges = (changes) => {
		if (changes.selected != null && changes.selected.currentValue != null) {
			$ctrl.configuration = configurator().select(changes.selected.currentValue);
			$ctrl.selectedElement = customSelector(changes.selected);
		}
	}

	$ctrl.changeVisible = () => {
		$ctrl.visible = !$ctrl.visible;
	}

}

export default angular
	.module("app.workspace.nosql.sidebar", [])
	.component("sidebarControlNosql", {
		template,
		controller,
		bindings: {
			selected: "<",
			onUpdate: "&",
		},
	}).name;