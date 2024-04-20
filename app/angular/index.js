import angular from "angular";

import "angular-ui-router";
import "angular-ui-bootstrap";
import "angular-cookies";
import "angular-translate";
import "textangular";

import "jointjs";
import jointCss from "jointjs/dist/joint.min.css";
import "bootstrap/dist/css/bootstrap.css";
import "font-awesome/css/font-awesome.min.css";
import "../sass/app.scss";

import "oclazyload";

import sidebarControlConceptual from "./conceptual/sidebarControl";
import sidebarControlLogic from "./logic/sidebarControl";
import authService from "./service/authService";
import modelService from "./service/modelAPI";
import dropdownComponent from "./components/dropdown";
import dropdownIconComponent from "./components/dropdownIcon";
import logicService from "./service/logicService";
import logicFactory from "./service/logicFactory";

import pt_BR from "../i18n/languages/pt_BR";
import en from "../i18n/languages/en";

/*
 * This line prevent a sideEffect issue in jointjs library that make webpack ignore joint css imports
 * See more: https://github.com/webpack/webpack/issues/8814
 */
console.log(jointCss)

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
	logicFactory,
	sidebarControlConceptual,
	dropdownIconComponent,
	sidebarControlLogic
]);

app.config([
	"$translateProvider",
	function ($translateProvider) {
		$translateProvider.translations("en", en);
		$translateProvider.translations("pt_BR", pt_BR);
		const browserLanguage = navigator.language === "pt-BR" ? "pt_BR" : "en";
		$translateProvider.preferredLanguage(localStorage.getItem("i18n") || browserLanguage);
	},
]);

app.config(['$httpProvider', ($httpProvider) => {
	$httpProvider.interceptors.push($q => ({
	 	"request": (config) => {
			const regex = /.*\.(html)/;
			if (config.url.match(regex)) return config;
			const apiUrl = process.env.API_URL || "http://localhost:3000"
			config.url = `${apiUrl}${config.url}`
			return config;
		 }
	}));
	$httpProvider.interceptors.push(($injector) => ({
		"request": (config) => {
			if ($injector.get("AuthService").isAuthenticated()) {
				config.headers["brx-access-token"] = $injector.get("AuthService").token;
			}
			return config;
		}
	}));
	}]);

app.config([
	"$urlRouterProvider",
	"$stateProvider",

	function ($urlRouterProvider, $stateProvider) {
		$stateProvider.state("login", {
			title: "Login - BRMW",
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
			title: "Register - BRMW",
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

		$stateProvider.state("recovery", {
			title: "Recovery - BRMW",
			url: "/recovery",
			component: "recovery",
			data: {
				requireLogin: false,
			},
			lazyLoad($transition$) {
				const $ocLazyLoad = $transition$.injector().get("$ocLazyLoad");
				return import("./recovery/recovery.js").then((mod) =>
					$ocLazyLoad.inject(mod.default)
				);
			},
		});

		$stateProvider.state("reset", {
			title: "Reset password - BRMW",
			url: "/reset/{mail}/{code}",
			component: "resetPassword",
			data: {
				requireLogin: false,
			},
			lazyLoad($transition$) {
				const $ocLazyLoad = $transition$.injector().get("$ocLazyLoad");
				return import("./recovery/reset.js").then((mod) =>
					$ocLazyLoad.inject(mod.default)
				);
			},
		});

		$stateProvider.state("main", {
			title: "Models list - BRMW",
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
			title: "Conceptual model - BRMW",
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
			title: "Logic model - BRMW",
			url: "/logic/{references:json}",
			component: "editorLogic",
			data: {
				requireLogin: true,
			},
			lazyLoad($transition$) {
				const $ocLazyLoad = $transition$.injector().get("$ocLazyLoad");
				return import("./logic/logic.js").then((mod) =>
					$ocLazyLoad.inject(mod.default)
				);
			},
		});

		$stateProvider.state("noaccess", {
			title: "No Access - BRMW",
			url: "/noaccess",
			component: "noAccess",
			data: {
				requireLogin: true,
			},
			lazyLoad($transition$) {
				const $ocLazyLoad = $transition$.injector().get("$ocLazyLoad");
				return import("./noaccess/noaccess.js").then((mod) =>
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

		$stateProvider.state("preferences", {
			title: "Preferences - BRMW",
			url: "/preferences",
			component: "preferences",
			data: {
				requireLogin: true,
			},
			lazyLoad($transition$) {
				const $ocLazyLoad = $transition$.injector().get("$ocLazyLoad");
				return import("./preferences/preferences.js").then((mod) =>
					$ocLazyLoad.inject(mod.default)
				);
			},
		});

		$urlRouterProvider.otherwise("/");
	},
]);

app.run(function ($transitions, $rootScope, AuthService, $state, $window, $location) {
	$transitions.onStart({}, function (trans) {
		const { requireLogin } = trans.to().data;
		if (requireLogin) {
			if (AuthService.isAuthenticated()) {
				$rootScope.loggeduser = AuthService.loggeduser;
				$rootScope.token = AuthService.token;
			} else {
				$state.go("login");
			}
		}
		$rootScope.title = trans.to().title;
		if (typeof $window.gtag === 'function' && !$location.absUrl().includes("localhost")) {
			$window.gtag('js', new Date());
			$window.gtag('event', 'page_view', { 'send_to': 'G-NQ9Z9PV306' });
		}
	});
});

app.config(function () {
	angular.lowercase = function (text) {
		return typeof text === "string" ? text.toLowerCase() : text;
	};
});


app.directive('autofocus', function($timeout) {
    return {
        restrict: 'A',
        link: function(_scope, _element) {
            $timeout(function(){
                _element[0].focus();
            }, 100);
        }
    };
});

app.$inject = ["$scope", "$http", "$cookies", "$uibModalInstance"];

