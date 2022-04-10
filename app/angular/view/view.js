import angular from "angular";
import { comparasionOperators } from "../service/queryExpressionService";
import template from "./view.html";

const app = angular.module("app.view", []);

const Controller = function (LogicService, $uibModal) {
	const $ctrl = this;

	const updateViewInfo = (view) => {
		const allTables = LogicService.loadTables();
		$ctrl.tables = view.tables;
		$ctrl.queryConditions = view.queryConditions;
		allTables.forEach(table => {
			if ($ctrl.tables.some(({ name }) => table.name === name)) return;
			$ctrl.tables.push(table);
		});
	}

	$ctrl.$onInit = () => {
		updateViewInfo($ctrl.view);
	};

	$ctrl.queryExpressionModal = () => {
		const modalInstance = $uibModal.open({
			animation: true,
			template: '<query-expression-modal query-conditions="$ctrl.queryConditions" tables="$ctrl.tables" close="$close(result)" dismiss="$dismiss(reason)"></query-expression-modal>',
			controller: function () {
				const ctrl = this;
				ctrl.tables = $ctrl.tables.filter(({ selected }) => selected);
				ctrl.queryConditions = $ctrl.view.queryConditions;
			},
			controllerAs: '$ctrl',
		});
		modalInstance.result.then(({ conditions, joins }) => {
			$ctrl.view.queryConditions = {
				joins: joins.filter(join => join.submitted),
				values: conditions,
				text: `${conditions.map(({ columnName, type, comparativeValue, comparativeValue2, logicalOperator }, index) =>
					`${columnName} ${comparasionOperators[type](comparativeValue, comparativeValue2)} ${conditions.length - 1 === index ? '' : logicalOperator}`).join(" ")}`
			}
		});
	};

	$ctrl.changeName = () => {
		if ($ctrl.view.name) {
			LogicService.editName($ctrl.view.name);
		}
	}

	$ctrl.$onChanges = (changes) => {
		if (changes.view != null && changes.view.currentValue != null) {
			updateViewInfo({ ...changes.view.currentValue });
		}
	}

	$ctrl.toggleForm = () => {
		$ctrl.formVisible = !$ctrl.formVisible;
	};

	$ctrl.cancel = () => {
		$ctrl.dismiss();
	};

	$ctrl.save = () => {
		let columns = [];
		const filteredTables = $ctrl.tables.filter(({ selected }) => selected);
		filteredTables.forEach(table => {
			table.columns.forEach(column => {
				if (column.selected) columns.push(column);
			});
		});
		const view = {
			...$ctrl.view,
			basedIn: filteredTables,
			columns,
		}
		LogicService.save(view);
	}
};

export default app.component("view", {
	template: template,
	bindings: {
		view: "<",
		isEdit: "<",
		dismiss: "<"
	},
	controller: Controller,
}).name;
