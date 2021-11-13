import angular from "angular";
import template from "./conversionOptionModal.html";

const app = angular.module("app.ConversionOptionModal", []);

const Controller = function () {
	const $ctrl = this;

	$ctrl.forward = function (selectedOption) {
		$ctrl.submitted = true;
		$ctrl.close({ result: selectedOption });
	};
};

export default app.component("conversionOptionModal", {
	template: template,
	bindings: {
		options: "<",
		summary: "<",
		title: "<",
		close: "&",
	},
	controller: Controller,
}).name;
