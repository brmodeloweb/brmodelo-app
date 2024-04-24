import angular from "angular";
import template from "./index.html";
import "./index.scss";

const githubSponsorBanner = function () {};

export default angular.module("app.githubSponsorBanner", []).component("githubSponsorBanner", {
	template,
	controller: githubSponsorBanner,
}).name;
