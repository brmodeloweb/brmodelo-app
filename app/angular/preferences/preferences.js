import angular from "angular";
import template from "./preferences.html";

const preferencesController = function($translate){

}

export default angular
	.module("app.preferences", [])
	.component("preferences", {
		template,
		controller: preferencesController,
	}).name;