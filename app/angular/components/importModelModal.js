import angular from "angular";
import template from "./ImportModelModal.html";

const app = angular.module("app.ImportModelModal", []);

const Controller = function () {
	const $ctrl = this;
	$ctrl.submitted = false;

	$ctrl.cancel = () => {
		$ctrl.dismiss({
			reason: "cancel",
		});
	};
};

export default app.component("importModelModal", {
	template: template,
	bindings: {
		close: "&",
		dismiss: "&"
	},
	controller: Controller,
}).name;
