import angular from "angular";
import template from "./confirmationModal.html";

const app = angular.module("app.confirmationModalController", []);

function controller() {
	const $ctrl = this;

	$ctrl.$onInit = () => {
		const {
			title,
			content,
			cancelLabel = "Cancelar",
			confirmLabel = "Confirmar",
		} = $ctrl.resolve.modalData;

		$ctrl.title = title;
		$ctrl.content = content;
		$ctrl.cancelLabel = cancelLabel;
		$ctrl.confirmLabel = confirmLabel;
	};

	$ctrl.confirm = () => {
		$ctrl.close({
			result: true,
		});
	};

	$ctrl.cancel = () => {
		$ctrl.dismiss({
			reason: "cancel",
		});
	};
}

export default app.component("confirmationModal", {
	template,
	bindings: {
		close: "&",
		dismiss: "&",
		resolve: "<",
	},
	controller,
}).name;
