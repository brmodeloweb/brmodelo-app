import angular from "angular";
import template from "./checkConstraint.html";

const app = angular.module("app.checkConstraint", []);

const Controller = function () {
	const $ctrl = this;

	$ctrl.isManual = true;

	$ctrl.toggleFormType = () => {
		$ctrl.isManual = !$ctrl.isManual;
	}

	$ctrl.checkConstraintOptions = {
		NUMBER: [
			{ name: 'Equal to', type: 'EQUAL_TO' },
			{ name: 'Not equal to', type: 'NOT_EQUAL_TO' },
			{ name: 'Greater than', type: 'GREATER_THAN' },
			{ name: 'Less than', type: 'LESS_THAN' },
			{ name: 'Between', type: 'BETWEEN' },
			{ name: 'Greater than or equal to', type: 'GREATER_THAN_OR_EQUAL_TO' },
			{ name: 'Less than or equal to', type: 'LESS_THAN_OR_EQUAL_TO' },
		],
		STRING: [
			{ name: 'Is', type: 'IS' },
			{ name: 'Is not', type: 'IS_NOT' },
			{ name: 'Contains', type: 'CONTAINS' },
			{ name: 'Does not contain', type: 'DOES_NOT_CONTAIN' },
			{ name: 'Starts with', type: 'STARTS_WITH' },
			{ name: 'Ends with', type: 'ENDS_WITH' },
		]
	};

	$ctrl.selectCheckConstraint = (selected) => {
		$ctrl.column.checkConstraint = {
			type: selected.type,
			name: selected.name,
		};
	}

	$ctrl.$onChanges = (changes) => {
		if (changes.column != null && changes.column.currentValue != null) {
			$ctrl.column = changes.column.currentValue;
			$ctrl.isManual = !$ctrl.column.checkConstraint;
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