import angular from "angular";
import template from "./index.html";
import "./index.scss";

const iconClose = function () {};

export default angular.module("app.iconClose", []).component("iconClose", {
	template,
	controller: iconClose
}).name;
