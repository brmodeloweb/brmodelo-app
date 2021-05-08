import angular from "angular";

import "angular-ui-router";
import "angular-ui-bootstrap";
import "angular-cookies";
import "angular-translate";
import "textangular";
import "sweet-feedback/css/sweetfeedback.css";

//import "jquery";


// console.log(joint);
// console.log(angular);
// console.log($);

import "jointjs"
import "bootstrap/dist/css/bootstrap.css";
import "font-awesome/css/font-awesome.min.css";
import "../sass/app.scss";

import "../joint/joint.ui.halo.css";
import "../joint/joint.ui.selectionView.css";
import "../joint/joint.ui.stencil.css";

import loginComponent from "./login/login";
import signupComponent from "./signup/signup";
import workspaceComponent from "./workspace/workspace";
import conceptualComponent from "./conceptual/conceptual";
import logicComponent from "./logic/logic";
import authService from "./service/authService";
import modelService from "./service/modelAPI";
import dropdownComponent from "./components/dropdown";
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
	loginComponent,
	signupComponent,
	workspaceComponent,
	logicComponent,
	authService,
	modelService,
	logicService,
	dropdownComponent,
	conceptualComponent,
	shapeFactory,
	logicFactory
]);

app.config(['$translateProvider', function ($translateProvider) {
  $translateProvider.translations('en', en);

  $translateProvider.translations('pt_BR', pt_BR);

  $translateProvider.preferredLanguage('pt_BR');
}]);

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
			template: "<signup></signup>",
			data: {
				requireLogin: false,
			},
		});

		$stateProvider.state("main", {
			url: "/main",
			template: "<workspace></workspace>",
			data: {
				requireLogin: true,
			},
		});

		$stateProvider.state("conceptual", {
			url: "/conceptual/{modelid}",
			template: "<editor-conceptual></editor-conceptual>",
			data: {
				requireLogin: true,
			},
		});

		$stateProvider.state("logicx", {
			url: "/logicx/{references:json}",
			template: "<editor-logic></editor-logic>",
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


app.run(function ($transitions, $rootScope, AuthService, $state) {
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

app.$inject = ["$scope", "$http", "$cookies", "$uibModalInstance"];
