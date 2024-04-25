import angular from "angular";
import template from "./importModelModal.html";

const app = angular.module("app.importModelModal", []);

const Controller = function (ModelAPI, AuthService, $timeout) {
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
		$ctrl.loading = false;
		$ctrl.feedback = {
			showing: false
		}
	};

	$ctrl.cancel = () => {
		$ctrl.dismiss({
			reason: "cancel",
		});
	};

	$ctrl.showErrorFeedback = () => {
		$timeout(() => {
			$ctrl.feedback.showing = true;
		})
	};

	$ctrl.save = (url) => {
		const parts = url.split("/");
		const shareId = parts[parts.length-1];
		$ctrl.submitted = true;
		$ctrl.valid = validateUrl(url);
		if($ctrl.valid) {
			$ctrl.loading = true;
			ModelAPI.importModel(shareId, AuthService.loggeduser).then(response => {
				$ctrl.loading = false;
				$ctrl.close({result: response.data});
			}).catch(error => {
				$ctrl.loading = false;
				console.log(error);
				$ctrl.showErrorFeedback();
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
