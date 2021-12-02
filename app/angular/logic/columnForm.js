import angular from "angular";
import template from "./columnForm.html";

const app = angular.module("app.columnForm", []);

const Controller = function () {
	const $ctrl = this;

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
    tableNames: "<"
	},
	controller: Controller,
}).name;
