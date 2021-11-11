import angular from "angular";
import template from "./dropdownIcon.html";

const dropDownIconController = function ($element, $timeout) {
	const ctrl = this;
	ctrl.open = false;

	ctrl.toggle = (command) => {
		ctrl.open = command;
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

export default angular.module("app.dropdownIcon", []).component("dropdownIcon", {
	template,
	controller: dropDownIconController,
	bindings: {
		options: "<",
		selected: "<",
		onSelect: "&",
	},
	transclude: true
}).name;
