import angular from "angular";
import template from "./template.html";
import "./styles.scss";

const statusBarController = function () {};

export default angular.module("app.statusBar", []).component("statusBar", {
	template,
	controller: statusBarController,
	bindings: {
		updatedAt: "<",
	},
}).name;
