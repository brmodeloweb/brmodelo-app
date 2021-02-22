import angular from "angular";
import template from "./dropdown.html";

const dropDownController = function ($element, $timeout) {
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
				}, 300);
			}
		});
	};
};

export default angular.module("app.dropdown", []).component("dropdown", {
	template,
	controller: dropDownController,
	bindings: {
		options: "<",
		selected: "<",
		onSelect: "&",
	},
}).name;
