import angular from "angular";
import template from "./shareModelModal.html";

const app = angular.module("app.shareModelModal", []);

const Controller = function () {
	const $ctrl = this;
	$ctrl.submitted = false;

	$ctrl.cancel = () => {
		$ctrl.dismiss({
			reason: "cancel",
		});
	};
};

export default app.component("shareModelModal", {
	template: template,
	bindings: {
		close: "&",
		dismiss: "&"
	},
	controller: Controller,
}).name;