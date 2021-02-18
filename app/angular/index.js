import angular from "angular";
import "angular-ui-router";
import "angular-ui-bootstrap";
import "angular-cookies";
import "textangular";

import "../sass/app.scss";
import "../sass/atomic.scss";
import "../sass/buttons.scss";
import "../sass/feedback.scss";
import "../sass/form.scss";
import "../sass/joint-custom.scss";
import "../sass/mainHeader.scss";
import "../sass/modal.scss";
import "../sass/modelWorkspace.scss";
import "../sass/print.scss";
import "../sass/public.scss";
import "../sass/selectOptions.scss";
import "../sass/sql.scss";
import "../sass/structure.scss";
import "../sass/tables.scss";

import loginComponent from "./login/login";

console.log("loginComponent", loginComponent);

const app = angular.module("app", [
	"ui.router",
	"ui.bootstrap",
	"ngCookies" /** textangular */,
	loginComponent,
]);

app.config([
	"$urlRouterProvider",
	"$stateProvider",

	function ($urlRouterProvider, $stateProvider) {
		$stateProvider.state("login", {
			url: "/",
			template: "<login></login>",
			data: {
				requireLogin: false,
			},
		});

		$stateProvider.state("register", {
			url: "/register",
			templateUrl: "angular/view/register.html",
			data: {
				requireLogin: false,
			},
		});

		$stateProvider.state("workspace", {
			url: "/workspace",
			templateUrl: "angular/view/workspace.html",
			data: {
				requireLogin: true,
			},
		});

		$stateProvider.state("main", {
			url: "/main",
			templateUrl: "angular/view/main.html",
			data: {
				requireLogin: true,
			},
		});

		$stateProvider.state("conceptual", {
			url: "/conceptual/{modelid}",
			templateUrl: "angular/view/conceptual.html",
			data: {
				requireLogin: true,
			},
		});

		$stateProvider.state("logic", {
			url: "/logic/{references:json}",
			templateUrl: "angular/view/logic.html",
			data: {
				requireLogin: true,
			},
		});

		$stateProvider.state("sql", {
			url: "/sql/{code}",
			templateUrl: "angular/view/sql.html",
			data: {
				requireLogin: true,
			},
		});

		$urlRouterProvider.otherwise("/");
	},
]);
