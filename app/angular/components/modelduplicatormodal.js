import angular from "angular";
import template from "./modelduplicatormodal.html";

const app = angular.module("app.duplicateModelModalController", []);

function Controller() {
	const $ctrl = this;
	$ctrl.submitted = false;

	$ctrl.$onInit = () => {
		$ctrl.name = $ctrl.suggestedName;
	};

	$ctrl.save = function (modelname) {
		$ctrl.submitted = true;
		if (modelname != null && modelname != "") {
			$ctrl.close({
				result: modelname,
			});
		}
	};

	$ctrl.cancel = function () {
		$ctrl.dismiss({
			reason: "cancel",
		});
	};
}

export default app.component("modelDuplicatorModal", {
	template: template,
	bindings: {
		close: "&",
		dismiss: "&",
		suggestedName: "<",
	},
	controller: Controller,
});
