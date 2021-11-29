import angular from "angular";
import template from "./createModelModal.html";

const app = angular.module("app.createModelModal", []);

const Controller = function ($rootScope, $filter) {
	const $ctrl = this;
	$ctrl.typeSelected = {};
	$ctrl.submitted = false;

	$ctrl.options = [
		{ name: $filter('translate')('Conceptual'), type: 'conceptual'},
		{ name: $filter('translate')('Logical'), type: 'logic' }
	];

	$ctrl.$onInit = () => {
		$ctrl.typeSelected = { name: $filter('translate')("Conceptual"), type: "conceptual" };
	};

	$ctrl.doSelectType = function (newSelectedType) {
		$ctrl.typeSelected = newSelectedType;
	};

	$ctrl.save = function (modelname) {
		$ctrl.submitted = true;
		if (modelname != null && modelname != "") {
			const newmodel = {
				name: modelname,
				user: $rootScope.loggeduser,
				type: $ctrl.typeSelected.type,
				model: '{"cells":[]}',
			};
			$ctrl.close({ result: newmodel });
		}
	};

	$ctrl.cancel = function () {
		$ctrl.dismiss({
			reason: "cancel",
		});
	};
};
export default app.component("createModelModal", {
	template: template,
	bindings: {
		close: "&",
		dismiss: "&",
	},
	controller: Controller,
}).name;
