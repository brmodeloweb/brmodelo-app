import angular from "angular";

import "angular-ui-router";
import "angular-ui-bootstrap";
import "angular-cookies";
import "angular-translate";
import "textangular";
import "sweet-feedback/css/sweetfeedback.css";

import "jointjs";
import "bootstrap/dist/css/bootstrap.css";
import "font-awesome/css/font-awesome.min.css";
import "../sass/app.scss";

import "../joint/joint.ui.halo.css";
import "../joint/joint.ui.selectionView.css";
import "../joint/joint.ui.stencil.css";
import "oclazyload";

import { Visualizer } from "@uirouter/visualizer";

import sidebarControlConceptual from "./conceptual/sidebarControl";
import authService from "./service/authService";
import modelService from "./service/modelAPI";
import dropdownComponent from "./components/dropdown";
import dropdownIconComponent from "./components/dropdownIcon";
import shapeFactory from "./service/shapeFactory";
import logicService from "./service/logicService";
import logicFactory from "./service/logicFactory";

import pt_BR from "../i18n/languages/pt_BR";
import en from "../i18n/languages/en";

const app = angular.module("app", [
	"ui.router",
	"ui.bootstrap",
	"pascalprecht.translate",
	"ngCookies" /** textangular */,
	"oc.lazyLoad",
	authService,
	modelService,
	logicService,
	dropdownComponent,
	shapeFactory,
	logicFactory,
	sidebarControlConceptual,
	shapeFactory,
	dropdownIconComponent,
]);

app.config([
	"$translateProvider",
	function ($translateProvider) {
		$translateProvider.translations("en", en);

		$translateProvider.translations("pt_BR", pt_BR);

		$translateProvider.preferredLanguage("pt_BR");
	},
]);

app.config([
	"$urlRouterProvider",
	"$stateProvider",

	function ($urlRouterProvider, $stateProvider) {
		$stateProvider.state("login", {
			url: "/",
			component: "login",
			data: {
				requireLogin: false,
			},
			lazyLoad($transition$) {
				const $ocLazyLoad = $transition$.injector().get("$ocLazyLoad");
				return import("./login/login.js").then((mod) =>
					$ocLazyLoad.inject(mod.default)
				);
			},
		});

		$stateProvider.state("register", {
			url: "/register",
			component: "signup",
			data: {
				requireLogin: false,
			},
			lazyLoad($transition$) {
				const $ocLazyLoad = $transition$.injector().get("$ocLazyLoad");
				return import("./signup/signup.js").then((mod) =>
					$ocLazyLoad.inject(mod.default)
				);
			},
		});

		$stateProvider.state("main", {
			url: "/main",
			component: "workspace",
			data: {
				requireLogin: true,
			},
			lazyLoad($transition$) {
				const $ocLazyLoad = $transition$.injector().get("$ocLazyLoad");
				return import("./workspace/workspace.js").then((mod) =>
					$ocLazyLoad.inject(mod.default)
				);
			},
		});

		$stateProvider.state("conceptual", {
			url: "/conceptual/{modelid}",
			component: "editorConceptual",
			data: {
				requireLogin: true,
			},
			lazyLoad($transition$) {
				const $ocLazyLoad = $transition$.injector().get("$ocLazyLoad");
				return import("./conceptual/conceptual.js").then((mod) =>
					$ocLazyLoad.inject(mod.default)
				);
			},
		});

		$stateProvider.state("logic", {
			url: "/logic/{references:json}",
			component: "editorLogic",
			data: {
				requireLogin: true,
			},
			lazyLoad($transition$) {
				const $ocLazyLoad = $transition$.injector().get("$ocLazyLoad");
				return import("./conceptual/conceptual.js").then((mod) =>
					$ocLazyLoad.inject(mod.default)
				);
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

app.run(function ($transitions, $rootScope, AuthService, $state, $uiRouter) {
	$uiRouter.plugin(Visualizer);

	$transitions.onStart({}, function (trans) {
		const { requireLogin } = trans.to().data;
		if (requireLogin) {
			if (AuthService.isAuthenticated()) {
				$rootScope.loggeduser = AuthService.loggeduser;
			} else {
				$state.go("login");
			}
		}
	});
});

app.config(function () {
	angular.lowercase = function (text) {
		return typeof text === "string" ? text.toLowerCase() : text;
	};
});

app.config;

app.$inject = ["$scope", "$http", "$cookies", "$uibModalInstance"];
