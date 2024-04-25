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
			$ctrl.importAllowed = shareConfig.importAllowed;
			$ctrl.backupConfig = shareConfig;
		});
	};

	const hasChanges = (newActive, newImportAllowed) => {
		return $ctrl.backupConfig.active != newActive || $ctrl.backupConfig.importAllowed != newImportAllowed;
	}

	$ctrl.toggleShare = (shared) => {
		$ctrl.url = shared? $ctrl.backupConfig.url : "";
		if (!shared) {
			$ctrl.importAllowed = false;
		}
	}

	$ctrl.cancel = () => {
		$ctrl.dismiss({reason: "cancel"});
	};

	$ctrl.save = () => {
		if(hasChanges($ctrl.shared, $ctrl.importAllowed)) {
			ModelAPI.toggleShare($ctrl.modelId, $ctrl.shared, $ctrl.importAllowed).then(() => {
				$ctrl.close({reason: "model shared"});
			}).catch(error => {
				console.log(error);
				$ctrl.dismiss({reason: "model share error"});
			});
		} else {
			$ctrl.close({reason: "model shared"});
		}
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