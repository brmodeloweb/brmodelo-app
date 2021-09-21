import angular from "angular";
import template from "./sidebarControl.html";

const configurator = () => {

  const configuration = {
    "emptyState": true
  }

  const selelect = (element) => {

  }

  return {
    configuration
  }
}


const controller = function () {
  const $ctrl = this;
  $ctrl.visible = true;

  $ctrl.$onInit = () => {
    $ctrl.configuration = configurator().configuration;
  }

  $ctrl.changeVisible = () => {
    $ctrl.visible = !ctrl.visible;
  }

}

export default angular
	.module("app.workspace.conceptual.sidebar", [])
	.component("sidebarControlConceptual", {
		template,
		controller,
    bindings: {
      options: "<",
      selected: "<",
      onSelect: "&",
    },
	}).name;