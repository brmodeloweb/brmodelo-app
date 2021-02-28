import angular from "angular";
import template from "./deleteModelModal.html";

const app = angular.module("app.modelDeleterModal", []);

function Controller() {
	const $ctrl = this;

	$ctrl.delete = () => {
		$ctrl.close({
			result: "delete",
		});
	};

	$ctrl.cancel = () => {
		$ctrl.dismiss({
			reason: "cancel",
		});
	};
}

export default app.component("deleteModelModal", {
	template: template,
	bindings: {
		close: "&",
		dismiss: "&",
	},
	controller: Controller,
}).name;
