import angular from "angular";
import template from "./sidebarControl.html";

const configurator = () => {

  const configuration = {
    "emptyState": false,
    "entity": false,
    "relationship": false,
    "extension": false,
  }

  const emptyState = () => {
    configuration.emptyState = true;
    return configuration;
  }

  const select = (element) => {
    if(element.type == "Entity") {
      configuration.entity = true;
      return configuration;
    }
    return emptyState();
  }

  return {
    emptyState,
    select
  }
}


const controller = function () {
  const $ctrl = this;
  $ctrl.visible = true;
  $ctrl.selectedElement = {}

  $ctrl.$onInit = () => {
    $ctrl.configuration = configurator().emptyState();
  }

  $ctrl.updateName = function(newName) { 
    if(newName != "") {
      $ctrl.onUpdate({"event": {
        "type": "name",
        "value":  newName
      }});
    }
  }

  $ctrl.$onChanges = function(changes) { 
    if(changes.selected != null && changes.selected.currentValue != null) {
      console.log(changes);
      $ctrl.configuration = configurator().select(changes.selected.currentValue);
      $ctrl.selectedElement = changes.selected.currentValue;
    }
  }

  $ctrl.changeVisible = () => {
    $ctrl.visible = !$ctrl.visible;
  }

}

export default angular
	.module("app.workspace.conceptual.sidebar", [])
	.component("sidebarControlConceptual", {
		template,
		controller,
    bindings: {
      selected: "<",
      onUpdate: "&",
    },
	}).name;