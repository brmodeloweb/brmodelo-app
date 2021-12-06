import angular from "angular";
import template from "./sidebarControl.html";
import Column from "../service/Column";

const app = angular.module("app.sidebarControl", []);

const Controller = function (LogicService) {
	const $ctrl = this;

	$ctrl.visible = true;

	$ctrl.sections = {
		tableProperties: true,
		columns: false,
		views: false,
	}

	$ctrl.toggleSection = (section) => {
		$ctrl.sections[section] = !$ctrl.sections[section];
	}

	$ctrl.changeVisible = () => {
		$ctrl.visible = !$ctrl.visible;
	}

	$ctrl.changeName = () => {
		if ($ctrl.selectedName) {
			LogicService.editName($ctrl.selectedName);
		}
	}

	$ctrl.deleteColumn = ($index) => {
		LogicService.deleteColumn($index);
	}

	$ctrl.editionColumnMode = (column) => {
		loadTables();
		$ctrl.editColumnModel = JSON.parse(JSON.stringify(column));
		$ctrl.closeAllColumns();
		column.expanded = true;
	}

	$ctrl.editColumn = (editedColumn, $index) => {
		if (editedColumn.name == "") {
			$ctrl.showFeedback("The column name cannot be empty!", true, "error");
			return;
		}

		LogicService.editColumn($index, editedColumn);

		$ctrl.closeAllColumns();
	}

	$ctrl.closeAllColumns = function () {
		$ctrl.columns.forEach(column => {
			column.expanded = false;
		});
	}

	$ctrl.addColumn = function (column) {
		if (column.name == "") {
			$ctrl.showFeedback("The column name cannot be empty!", true, "error");
			return;
		}

		if (column.FK && column.tableOrigin.idName == "") {
			$ctrl.showFeedback("Select the foreign table source!", true, "error");
			return;
		} else {
			column.tableOrigin.idOrigin = $ctrl.mapTables.get(column.tableOrigin.idName);
		}

		LogicService.addColumn(column);
		$ctrl.addColumnModel = $ctrl.newColumnObject();
		$ctrl.addColumnVisible = false;
	}

	$ctrl.showAddColumn = function (show) {
		$ctrl.addColumnVisible = show;
		$ctrl.addColumnModel = $ctrl.newColumnObject();
		loadTables();
	}

	const loadTables = () => {
		$ctrl.tableNames = [];
		$ctrl.mapTables = LogicService.getTablesMap();
		for (var key of $ctrl.mapTables.keys()) {
			$ctrl.tableNames.push({ name: key, type: key });
		}
	}

	$ctrl.newColumnObject = function () {
		return new Column();
	}

	$ctrl.addColumnModel = $ctrl.newColumnObject();
	$ctrl.editColumnModel = $ctrl.newColumnObject();

	const clearSidebar = () => {
		$ctrl.selectedElement = null;
		$ctrl.selectedName = null;
		$ctrl.selectedType = null;
		$ctrl.columns = null;
	}

	$ctrl.$onChanges = (changes) => {
		if (!changes.selected.currentValue) clearSidebar();
		if (changes.selected != null && changes.selected.currentValue != null) {
			$ctrl.selectedElement = changes.selected.currentValue;
			$ctrl.selectedName = changes.selected.currentValue.attributes.name;
			$ctrl.selectedType = changes.selected.currentValue.attributes.type;
			$ctrl.columns = changes.selected.currentValue.attributes.objects;
		}
	}
};

export default app.component("sidebarControlLogical", {
	template: template,
	bindings: {
		selected: "<",
		showFeedback: "<",
	},
	controller: Controller,
}).name;
