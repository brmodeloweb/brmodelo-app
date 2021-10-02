import angular from "angular";
import template from "./sidebarControl.html";

const configurator = () => {

  const configuration = {
    "emptyState": false,
    "entity": false,
    "relationship": false,
    "extension": false,
    "attribute": false,
    "key": false
  }

  const emptyState = () => {
    configuration.emptyState = true;
    return configuration;
  }

  const select = (element) => {
    switch (element.type) {
      case "Entity":
        configuration.entity = true;
        return configuration;
      case "Attribute":
        configuration.attribute = true;
        return configuration;
      case "Key":
        configuration.key = true;
        return configuration;
      case "Relationship":
        configuration.relationship = true;
        return configuration;
      case "Inheritance":
        configuration.extension = true;
        return configuration;
      default:
        break;
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

  $ctrl.updateName = function (newName) {
    if (newName != "") {
      $ctrl.onUpdate({
        "event": {
          "type": "name",
          "value": newName
        }
      });
    }
  }

  $ctrl.extendEntity = function (selected) {
    $ctrl.onUpdate({
      "event": {
        "type": "extention",
        "value": selected.type
      }
    });
  }

  $ctrl.$onChanges = function (changes) {
    if (changes.selected != null && changes.selected.currentValue != null) {
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