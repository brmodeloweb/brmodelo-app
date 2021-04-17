import angular from "angular";
import template from "./sidebarControl.html";

const controller = function () {
  const ctrl = this;
  ctrl.visible = false;

  ctrl.changeVisible = () => {
    ctrl.visible = !ctrl.visible;
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