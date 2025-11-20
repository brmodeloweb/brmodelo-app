import angular from "angular";
import template from "./index.html";
import "./index.scss";
import iconClose from "../icons/close";

const bannerWhatsNew = function () {};

export default angular
	.module("app.bannerWhatsNew", [
		iconClose
	])
	.component("bannerWhatsNew", {
		template,
		controller: bannerWhatsNew,
}).name;
