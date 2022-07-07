import angular from "angular";
import template from "./template.html";

const Controller = function () {
	const $ctrl = this;

	$ctrl.select = selected => {
		$ctrl.selected = selected;
		$ctrl.onSelect({ selected });
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
};

export default angular.module("app.sqlComparasionDropdown", []).component("sqlComparasionDropdown", {
	template,
	controller: Controller,
	bindings: {
		type: "<",
		selected: "<",
		onSelect: "&"
	},
}).name;
