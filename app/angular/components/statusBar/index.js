import angular from "angular";
import template from "./template.html";
import "./styles.scss";

const statusBarController = function () {
	const ctrl = this;

	console.log("ctrl", ctrl);
};

export default angular.module("app.statusBar", []).component("statusBar", {
	template,
	controller: statusBarController,
	bindings: {
		updatedAt: "<",
	},
}).name;
