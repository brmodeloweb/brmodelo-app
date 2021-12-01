import angular from "angular";
import template from "./view.html";

const app = angular.module("app.view", []);

const Controller = function () {
	const $ctrl = this;

  $ctrl.view = {};

  $ctrl.$onChanges = (changes) => {
		if (changes.table != null && changes.table.currentValue != null) {
			$ctrl.view = changes.table.currentValue;
		}
	}

	$ctrl.toggleForm = () => {
		$ctrl.formVisible = !$ctrl.formVisible;
	};

  $ctrl.save = () => {
    console.log($ctrl.view);
  }
};

export default app.component("view", {
	template: template,
	bindings: {
    table: "<",
	},
	controller: Controller,
}).name;
