import angular from "angular";

import "angular-ui-router";
import "angular-ui-bootstrap";
import "angular-cookies";
import "textangular";
import "jquery/dist/jquery.min";

import "bootstrap/dist/css/bootstrap.css";
import "font-awesome/css/font-awesome.min.css";
import "../sass/app.scss";
// import "../joint/joint.ui.halo.css";
// import "../joint/joint.ui.selectionView.css";
// import "../joint/joint.ui.stencil.css";

import loginComponent from "./login/login";
import signupComponent from "./signup/signup";
import workspaceComponent from "./workspace/workspace";
import authService from "./service/authService";
import modelService from "./service/modelAPI";
import dropdownComponent from "./components/dropdown";
import modelDuplicatorComponent from "./components/duplicateModelModal";
import modelDeleterComponent from "./components/deleteModelModal";
import modelRenameComponent from "./components/renameModelModal";
import modelCreateComponent from "./components/createModelModal";

const app = angular.module("app", [
	"ui.router",
	"ui.bootstrap",
	"ngCookies" /** textangular */,
	loginComponent,
	signupComponent,
	workspaceComponent,
	authService,
	modelService,
	dropdownComponent,
	modelDuplicatorComponent,
	modelDeleterComponent,
	modelRenameComponent,
	modelCreateComponent
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
