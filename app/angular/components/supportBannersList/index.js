import angular from "angular";
import template from "./index.html";
import "./index.scss";

const supportBannersList = function () {};

export default angular
.module("app.supportBannersList", [])
.component("supportBannersList", {
	template,
	comtroller: supportBannersList,
}).name