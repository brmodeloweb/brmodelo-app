import angular from "angular";
import template from "./checkConstraint.html";

const app = angular.module("app.checkConstraint", []);

const Controller = function () {
	const $ctrl = this;

	$ctrl.isManual = true;

	$ctrl.toggleFormType = () => {
		$ctrl.isManual = !$ctrl.isManual;
	}

	$ctrl.selectCheckConstraint = (selected) => {
		$ctrl.column.checkConstraint = {
			type: selected.type,
			name: selected.name,
		};
	}

	$ctrl.$onChanges = (changes) => {
		if (changes.column != null && changes.column.currentValue != null) {
			$ctrl.column = changes.column.currentValue;
			$ctrl.isManual = ($ctrl.column.checkConstraint || {}).checkExpression;
		}
	}
}

export default app.component("checkConstraint", {
	template: template,
	bindings: {
		column: "<",
	},
	controller: Controller,
}).name;