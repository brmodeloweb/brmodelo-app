import angular from "angular";
import template from "./sidebarControl.html";
import Column from "../service/Column";

const Controller = function (LogicService, $rootScope, $timeout) {
	const $ctrl = this;

	$ctrl.visible = true;
	$ctrl.views = [];

	$ctrl.sections = {
		tableProperties: true,
		columns: false,
		views: false,
	}

	$rootScope.$on('command:openmenu', () => {
		$timeout(() => {
			$ctrl.visible = true;
		});
	});

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

	$ctrl.getTableOriginName = (tableId) => {
		const tables = [...$ctrl.mapTables].map(([name, value]) => ({ name, value }));
		return tables.find(() => tableId)?.name;
	}

	$ctrl.editionColumnMode = (column) => {
		loadTableNames();
		const columnValues = JSON.parse(JSON.stringify(column));
		$ctrl.editColumnModel = {
			...columnValues,
			tableOrigin: {
				...columnValues.tableOrigin,
				idName: $ctrl.getTableOriginName(columnValues.tableOrigin.idOrigin),
			}
		};
		$ctrl.closeAllColumns();
		column.expanded = true;
	}

	$ctrl.closeAllViews = () => {
		$ctrl.views.forEach(view => {
			view.expanded = false;
		});
	}

	$ctrl.editView = (view) => {
		$ctrl.closeAllViews();
		view.expanded = true;
	}

	$ctrl.editColumn = (editedColumn, $index) => {
		const column = $ctrl.checkColumnBeforeSave(editedColumn);

		if (column) {
			LogicService.editColumn($index, editedColumn);
			$ctrl.closeAllColumns();
		}
	}

	$ctrl.closeAllColumns = function () {
		$ctrl.columns.forEach(column => {
			column.expanded = false;
		});
	}

	$ctrl.checkColumnBeforeSave = function (column) {
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

		return column;
	}

	$ctrl.addColumn = function (addedColumn) {
		const column = $ctrl.checkColumnBeforeSave(addedColumn);

		if (column) {
			LogicService.addColumn(column);
			$ctrl.addColumnModel = $ctrl.newColumnObject();
			$ctrl.addColumnVisible = false;
		}
	}

	$ctrl.showAddColumn = function (show) {
		$ctrl.addColumnVisible = show;
		$ctrl.addColumnModel = $ctrl.newColumnObject();
		loadTableNames();
	}

	const loadTableNames = () => {
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

	$ctrl.clearSidebar = () => {
		$ctrl.selectedElement = null;
		$ctrl.selectedName = null;
		$ctrl.selectedType = null;
		$ctrl.columns = null;
	}

	$ctrl.$onChanges = (changes) => {
		if (!changes.selected.currentValue) $ctrl.clearSidebar();
		if (changes.selected != null && changes.selected.currentValue != null) {
			$ctrl.selectedElement = changes.selected.currentValue;
			$ctrl.selectedName = changes.selected.currentValue.attributes.name;
			$ctrl.selectedType = changes.selected.currentValue.attributes.type;
			$ctrl.columns = changes.selected.currentValue.attributes.objects;
			$ctrl.queryConditions = changes.selected.currentValue.attributes.queryConditions;
			if ($ctrl.selectedType === 'uml.Class') {
				$ctrl.views = LogicService.loadViewsByTable(changes.selected.currentValue.id);
			}
		}
	}
};

export default angular.module("app.sidebarControl", [])
	.component("sidebarControlLogical", {
	template: template,
	bindings: {
		selected: "<",
		showFeedback: "<",
	},
	controller: Controller,
}).name;
