import angular from "angular";
import template from "./conversionAttributeModal.html";

const app = angular.module("app.createModelModal", []);

const Controller = function () {
	const $ctrl = this;
	$ctrl.selectedValue = "new_column"

	$ctrl.forward = (selectedOption) => {
		$ctrl.submitted = true;
		$ctrl.close({ result: {"value": selectedOption, "quantity": $ctrl.qt}});
	};
};

export default app.component("conversionAttributeModal", {
	template: template,
	bindings: {
		options: "<",
		summary: "<",
		title: "<",
		close: "&",
	},
	controller: Controller,
}).name;
