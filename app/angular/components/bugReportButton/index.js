import angular from "angular";
import template from "./template.html";

const statusBarController = function () {};

export default angular
	.module("app.bugReportButton", [])
	.component("bugReportButton", {
		template,
		controller: statusBarController,
	}).name;
