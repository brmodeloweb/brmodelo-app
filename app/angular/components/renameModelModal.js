import angular from "angular";
import template from "./renameModelModal.html";

const app = angular.module("app.renameModelModal", []);

const Controller = function () {
	const $ctrl = this;
	$ctrl.submitted = false;

	$ctrl.rename = (newName) => {
		$ctrl.submitted = true;
		if (newName != null && newName != "") {
			$ctrl.close({
				result: newName,
			});
		}
	};

	$ctrl.cancel = () => {
		$ctrl.dismiss({
			reason: "cancel",
		});
	};
};

export default app.component("renameModelModal", {
	template: template,
	bindings: {
		close: "&",
		dismiss: "&",
	},
	controller: Controller,
}).name;
