import angular from "angular";
import LoginPage from "../../react/src/pages/login";
import authService from "../service/authService";
import template from "./login.html";

const LoginController = function (AuthService, $state, $translate, $filter) {
	const ctrl = this;
	ctrl.submitted = false;
	ctrl.credentials = {};
	ctrl.feedback = {
		message: "",
		showing: false,
	};

	const showError = (newMessage) => {
		ctrl.feedback.message = $filter('translate')(newMessage);
		ctrl.feedback.showing = true;
	};

	const handleLoginError = () => {
		ctrl.loading = false;
		showError("Incorrect login or password");
	};

	const handleLoginSuccess = () => {
		ctrl.loading = false;
		$state.go("main");
	};

	const doLogin = () => {
		ctrl.loading = true;
		AuthService.login(ctrl.credentials)
			.then(handleLoginSuccess)
			.catch(handleLoginError);
	};

	ctrl.goToRecoveryPassword = () => {
		$state.go("recovery");
	};

	ctrl.goToCreateAccount = () => {
		$state.go("register");
	};

	ctrl.changeLanguage = (langKey) => {
		localStorage.setItem('i18n', langKey);
		$translate.use(langKey);
	};

	ctrl.submitForm = (validForm) => {
		ctrl.submitted = true;
		ctrl.feedback.showing = false;
		if (validForm) {
			doLogin();
		} else {
			showError("Fill the fields in red");
		}
	};
};

export default angular
	.module("app.login", [authService, LoginPage])
	.component("login", {
		template,
		controller: LoginController,
	}).name;
