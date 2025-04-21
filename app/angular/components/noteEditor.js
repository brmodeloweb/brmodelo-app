import angular from "angular";
import template from "./noteEditor.html";

const app = angular.module("app.noteEditor", []);

const Controller = function () {
	const $ctrl = this;
	$ctrl.submitted = false;

	$ctrl.updateNoteText = (newText) => {
		$ctrl.selected.element.setText(newText);
	}

	$ctrl.updateNoteColor = (newColor) => {
		$ctrl.selected.element.setColor(newColor);
	}
};

export default app.component("noteEditor", {
	template: template,
	bindings: {
		selected: "<",
	},
	controller: Controller,
}).name;