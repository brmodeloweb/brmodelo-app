import angular from "angular";
import template from "./sidebarControl.html";

const configurator = () => {

	const configuration = {
		"emptyState": false,
		"entity": false,
		"relationship": false,
		"extension": false,
		"attribute": false,
		"connection": false,
		"link": false
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
			case "Link":
				configuration.link = true;
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

	$ctrl.updateName = (newName) => {
		if (newName != "") {
			$ctrl.onUpdate({
				"event": {
					"type": "name",
					"value": newName
				}
			});
		}
	}

	$ctrl.extendEntity = (selected) => {
		$ctrl.onUpdate({
			"event": {
				"type": "extention",
				"value": selected.type
			}
		});
	}

	$ctrl.updateCardinality = (selected) => {
		$ctrl.onUpdate({
			"event": {
				"type": "link.cardinality",
				"value": selected.type
			}
		});
	}

	$ctrl.updateLinkRole = (selected) => {
		$ctrl.onUpdate({
			"event": {
				"type": "link.role",
				"value": selected
			}
		});
	}

	$ctrl.updateLinkWeak = (selected) => {
		$ctrl.onUpdate({
			"event": {
				"type": "link.weak",
				"value": selected
			}
		});
	}

	$ctrl.updateAttributeCardinality = (selected) => {
		$ctrl.onUpdate({
			"event": {
				"type": "attribute.cardinality",
				"value": selected.type
			}
		});
	}

	$ctrl.updateAttributeName = (newName) => {
		$ctrl.onUpdate({
			"event": {
				"type": "attribute.name",
				"value": newName
			}
		});
	}

	$ctrl.swapComposed = (value) => {
		$ctrl.onUpdate({
			"event": {
				"type": "attribute.composed",
				"value": value
			}
		});
	}

	$ctrl.transformAssociative = () => {
		$ctrl.onUpdate({
			"event": {
				"type": "relationship.associative",
			}
		});
	}

	const customSelector = (selected) => {
		const currentType = selected.currentValue.type;
		if (currentType === "Link") {
			const attributes = selected.currentValue.element.model.attributes;
			selected.currentValue.value = {
				"weak": attributes.weak,
				"role": attributes.role,
				"cardinality": attributes.labels[0].attrs.text.text
			}
		}

		if (currentType === "Attribute") {
			const attributes = selected.currentValue.element.model.attributes;
			selected.currentValue.value = {
				"name": attributes.attrs.text.text.replace(/ *\([^)]*\) */g, ""),
				"cardinality": attributes.cardinality,
				"composed": attributes.composed
			}
		}
		return selected.currentValue;
	}

	$ctrl.$onChanges = (changes) => {
		if (changes.selected != null && changes.selected.currentValue != null) {
			$ctrl.configuration = configurator().select(changes.selected.currentValue);
			$ctrl.selectedElement = customSelector(changes.selected);
		}
	}

	$ctrl.changeVisible = () => {
		$ctrl.visible = !$ctrl.visible;
	}

	$ctrl.addAutoRelationship = () => {
		$ctrl.onUpdate({
			"event": {
				"type": "addAutoRelationship"
			}
		});
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