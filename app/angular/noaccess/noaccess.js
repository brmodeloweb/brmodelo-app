import angular from "angular";
import template from "./noaccess.html";

const controller = function(){
	const ctrl = this;
}

export default angular
	.module("app.noaccess", [])
	.component("noAccess", {
		template,
		controller: controller,
	}).name;