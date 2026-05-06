import angular from "angular";
import template from "./dropdownIcon.html";
import themeService from "../service/themeService";

const dropDownIconController = function ($element, $timeout, ThemeService) {
	const ctrl = this;
	ctrl.open = false;
	ctrl.theme = ThemeService.getTheme();

	ctrl.toggle = (command) => {
		ctrl.open = command;
	};

	ctrl.setTheme = (theme) => {
		ctrl.theme = ThemeService.applyTheme(theme);
	};

	ctrl.select = (option) => {
		ctrl.selected = option;
		ctrl.toggle(false);
		ctrl.onSelect({ selected: option });
	};

	ctrl.$postLink = () => {
		$element.on("focusout", function () {
			if (ctrl.open) {
				$timeout(function () {
					ctrl.toggle(false);
				}, 150);
			}
		});
	};
};

export default angular.module("app.dropdownIcon", [themeService]).component("dropdownIcon", {
	template,
	controller: dropDownIconController,
	bindings: {
		options: "<",
		selected: "<",
		onSelect: "&",
	},
	transclude: true
}).name;
