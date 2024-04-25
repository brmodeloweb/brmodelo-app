import angular from "angular";
import template from "./ImportModelModal.html";

const app = angular.module("app.ImportModelModal", []);

const Controller = function (ModelAPI, AuthService) {
	const $ctrl = this;
	$ctrl.submitted = false;

	$ctrl.$onInit = () => {
		$ctrl.url = "teste";
	};


	$ctrl.cancel = () => {
		$ctrl.dismiss({
			reason: "cancel",
		});
	};

	$ctrl.save = (url) => {
		const parts = url.split("/");
		const shareId = parts[parts.length-1];
		console.log(AuthService);
		ModelAPI.importModel(shareId, AuthService.loggeduser).then(response => {
			$ctrl.close({result: response.data});
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
