import angular from "angular";
import template from "./duplicateModelModal.html";

const app = angular.module("app.duplicateModelModalController", []);

const Controller = function(ModelAPI) {
	const $ctrl = this;
	$ctrl.submitted = false;

	$ctrl.$onInit = () => {
		$ctrl.name = $ctrl.suggestedName;
	};

	$ctrl.save = function (newName) {
		$ctrl.submitted = true;
		if (newName != null && newName != "") {
			ModelAPI.duplicate($ctrl.modelId, $ctrl.userId, newName).then((newModelResponse) => {
				$ctrl.close({
					result: newModelResponse.data,
				});
			}).catch(error => {
				$ctrl.dismiss({
					result: "error",
					reason: error
				});
			});
		}
	};

	$ctrl.cancel = function () {
		$ctrl.dismiss({
			reason: "cancel",
		});
	};
};

export default app.component("duplicateModelModal", {
	template,
	bindings: {
		close: "&",
		dismiss: "&",
		suggestedName: "<",
		userId: "<",
		modelId: "<",
	},
	controller: Controller,
}).name;