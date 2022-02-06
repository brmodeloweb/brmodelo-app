import angular from "angular";
import template from "./template.html";
import "./styles.scss";

const app = angular.module("app.queryExpressionModalController", []);

const Controller = function ($filter) {
	const $ctrl = this;
	$ctrl.submitted = false;
	$ctrl.conditions = [];
	$ctrl.tableColumns = [];

	const defaultCondition = {
		columnName: null,
		columnType: null,
		type: null,
		comparativeValue: null,
		submitted: false,
		logicalOperator: 'AND',
	};

	$ctrl.createLabel = condition => {
		return `${condition.columnName} ${$filter('translate')(condition.name).toLowerCase()} ${condition.comparativeValue} ${condition.comparativeValue2 ? `${$filter('translate')('and')} ${condition.comparativeValue2}` : '' }`;
	}

	$ctrl.changeOperator = (index) => {
		const selectedCondition = $ctrl.conditions[index];
		$ctrl.conditions[index] = {
			...selectedCondition,
			logicalOperator: selectedCondition.logicalOperator === 'AND' ? 'OR' : 'AND',
		};
	}

	$ctrl.selectComparasion = (selected, index) => {
		const selectedCondition = $ctrl.conditions[index];
		$ctrl.conditions[index] = {
			...selectedCondition,
			name: selected.name,
			type: selected.type,
		};
	};

	$ctrl.removeCondition = (index) => {
		$ctrl.conditions.splice(index, 1);
	}

	$ctrl.saveCondition = (index) => {
		const selectedCondition = $ctrl.conditions[index];
		$ctrl.conditions[index] = {
			...selectedCondition,
			submitted: true,
		};
	}

	$ctrl.selectColumn = (selected, index) => {
		const selectedCondition = $ctrl.conditions[index];
		$ctrl.conditions[index] = {
			...selectedCondition,
			columnName: selected.name,
			columnType: selected.type
		};
	}

	$ctrl.addCondition = () => {
		$ctrl.conditions.push(defaultCondition);
	};

	$ctrl.$onInit = () => {
		$ctrl.tables.forEach(table => {
			table.columns.forEach(column => {
				$ctrl.tableColumns.push({
					name: `${table.name}.${column.name}`,
					type: column.type,
				});
			});
		});
	};

	$ctrl.$onChanges = (changes) => {
		if (changes.queryConditions != null && changes.queryConditions.currentValue != null) {
			$ctrl.conditions = changes.queryConditions.currentValue.values || [];
		}
	}

	$ctrl.save = function () {
		$ctrl.close({
			result: $ctrl.conditions.filter(condition => condition.submitted),
		});
	};

	$ctrl.cancel = function () {
		$ctrl.dismiss({
			reason: "cancel",
		});
	};
};

export default app.component("queryExpressionModal", {
	template,
	bindings: {
		close: "&",
		dismiss: "&",
		tables: "<",
		queryConditions: '<'
	},
	controller: Controller,
}).name;