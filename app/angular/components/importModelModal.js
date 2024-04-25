import angular from "angular";
import template from "./ImportModelModal.html";

const app = angular.module("app.ImportModelModal", []);

const Controller = function (ModelAPI, AuthService) {
	const $ctrl = this;
	const urlRegex = /^(https?:\/\/(?:[\w.-]+|\[::1\]|localhost)(?::\d{1,5})?\/#!\/publicview\/[\w.-]+)$/;;

	const validateUrl = (url) => {
		if(url == null || url == "") {
			return false
		}
		return urlRegex.test(url);
	}

	$ctrl.$onInit = () => {
		$ctrl.url = "";
		$ctrl.submitted = false;
		$ctrl.valid = false;
	};

	$ctrl.cancel = () => {
		$ctrl.dismiss({
			reason: "cancel",
		});
	};

	$ctrl.save = (url) => {
		const parts = url.split("/");
		const shareId = parts[parts.length-1];
		$ctrl.submitted = true;
		$ctrl.valid = validateUrl(url);
		if($ctrl.valid) {
			ModelAPI.importModel(shareId, AuthService.loggeduser).then(response => {
				$ctrl.close({result: response.data});
			});
		}
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
