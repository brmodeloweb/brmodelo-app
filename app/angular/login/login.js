import angular from "angular";
import ReactButton from "../../react/components/Button";
import authService from "../service/authService";
import template from "./login.html";

const LoginController = function (AuthService, $state, $translate) {
	const ctrl = this;
	ctrl.submitted = false;
	ctrl.credentials = {};
	ctrl.feedback = {
		message: "",
		showing: false,
	};

	const showError = (newMessage) => {
		ctrl.feedback.message = newMessage;
		ctrl.feedback.showing = true;
	};

	const handleLoginError = () => {
		ctrl.loading = false;
		showError("Login ou senha incorretos");
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

	ctrl.changeLanguage = (langKey) => {
		$translate.use(langKey);
	};

	ctrl.submitForm = (validForm) => {
		ctrl.submitted = true;
		ctrl.feedback.showing = false;
		if (validForm) {
			doLogin();
		} else {
			showError("Preencha os campos em vermelho");
		}
	};
};

export default angular
	.module("app.login", [authService, ReactButton])
	.component("login", {
		template,
		controller: LoginController,
	}).name;
