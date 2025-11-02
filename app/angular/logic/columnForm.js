import angular from "angular";
import template from "./columnForm.html";

const app = angular.module("app.columnForm", []);

const Controller = function () {
	const $ctrl = this;

	$ctrl.columnTypes = [
		{ name: 'DATE', type: 'DATE' },
		{ name: 'DATETIME', type: 'DATETIME' },
		{ name: 'TIME', type: 'TIME' },
		{ name: 'INT', type: 'INT' },
		{ name: 'BOOLEAN', type: 'BOOLEAN' },
		{ name: 'FLOAT', type: 'FLOAT' },
		{ name: 'VARCHAR', type: 'VARCHAR' },
		{ name: 'CHAR', type: 'CHAR' },
		{ name: 'JSON', type: 'JSON' },
		{ name: 'ENUM', type: 'ENUM' },
		{ name: 'SET', type: 'SET'}
	];

	$ctrl.cancel = () => {
		$ctrl.dismiss();
	};

	$ctrl.selectType = function (selected) {
		if (!$ctrl.column.PK && !$ctrl.column.FK) {
			$ctrl.column.type = selected.type;
		} else {
			$ctrl.column.type = "INT";
		}
	}

	$ctrl.selectTableOrigin = function (selected) {
		$ctrl.column.tableOrigin.idName = selected.name;
	}
};

export default app.component("columnForm", {
	template: template,
	bindings: {
		save: "<",
		dismiss: "&",
		column: "<",
		index: "<",
		tableNames: "<",
		delete: "<"
	},
	controller: Controller,
}).name;
