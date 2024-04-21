import angular from "angular";
import template from "./shareModelModal.html";

const app = angular.module("app.shareModelModal", []);

const Controller = function (ModelAPI) {
	const $ctrl = this;
	$ctrl.submitted = false;

	$ctrl.$onInit = () => {
		ModelAPI.loadShareOptions($ctrl.modelId).then(response => {
			const shareConfig = response.data;
			$ctrl.url = shareConfig.active ? shareConfig.url : "";
			$ctrl.shared = shareConfig.active;
		});
	};

	$ctrl.toggleShare = (shared) => {
		ModelAPI.toggleShare($ctrl.modelId, shared).then(response => {
			if(shared) {
				$ctrl.url = response.data.url;
			} else {
				$ctrl.url = "";
			}
		});
	};

	$ctrl.cancel = () => {
		$ctrl.dismiss({
			reason: "cancel",
		});
	};

	$ctrl.copy = () => {
		navigator.clipboard.writeText($ctrl.url);
	};
};

export default app.component("shareModelModal", {
	template: template,
	bindings: {
		close: "&",
		dismiss: "&",
		modelId: "<",
	},
	controller: Controller,
}).name;