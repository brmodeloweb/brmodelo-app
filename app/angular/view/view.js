import angular from "angular";
import template from "./view.html";

const app = angular.module("app.view", []);

const Controller = function (LogicService) {
	const $ctrl = this;

	$ctrl.$onInit = () => {
		const allTables = LogicService.loadTables();
		$ctrl.tables = $ctrl.view.tables;
		allTables.forEach(table => {
			if ($ctrl.tables.some(({ name }) => table.name === name)) return;
			$ctrl.tables.push(table);
		});
	};

	$ctrl.changeName = () => {
		if ($ctrl.view.name) {
			LogicService.editName($ctrl.view.name);
		}
	}

	$ctrl.$onChanges = (changes) => {
		if (changes.view != null && changes.view.currentValue != null) {
			$ctrl.view = changes.view.currentValue;
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
			})
		})
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
