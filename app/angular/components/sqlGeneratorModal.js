import angular from "angular";
import template from "./sqlGeneratorModal.html";

const app = angular.module("app.sqlGeneratorModal", []);

function Controller() {
	const $ctrl = this;

	$ctrl.cancel = () => {
		$ctrl.dismiss({
			reason: "cancel",
		});
	};
}

export default app.component("sqlGeneratorModal", {
	template: template,
	bindings: {
		close: "&",
		dismiss: "&",
		sql: "<",
	},
	controller: Controller,
}).name;
