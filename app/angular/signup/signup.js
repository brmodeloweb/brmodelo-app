import angular from "angular";
import authService from "../service/authService";
import template from "./signup.html";

const SignupController = function ($state, AuthService) {
	const ctrl = this;
	ctrl.submitted = false;
	ctrl.loading = false;
	ctrl.credentials = {
		username: "",
		email: "",
		password: "",
	};
	ctrl.feedback = {
		message: "",
		showing: false,
	};

	const showLoading = (loading) => {
		ctrl.loading = loading;
	};

	const handleLoginError = () => {
		showLoading(false);
		$state.go("login");
	};

	const handleLoginSuccess = () => {
		showLoading(false);
		$state.go("main");
	};

	const handleSignUpSuccess = () => {
		AuthService.login({
			username: ctrl.credentials.email,
			password: ctrl.credentials.password,
		})
			.then(handleLoginSuccess)
			.catch(handleLoginError);
	};

	const handleSignUpError = (error) => {
		showLoading(false);
		showError(error.data);
	};

	const doRegister = () => {
		showLoading(true);
		AuthService.register(ctrl.credentials)
			.then(handleSignUpSuccess)
			.catch(handleSignUpError);
	};

	const showError = (newMessage) => {
		ctrl.feedback.message = newMessage;
		ctrl.feedback.showing = true;
	};

	ctrl.submitForm = (validForm) => {
		ctrl.submitted = true;
		ctrl.feedback.showing = false;
		if (validForm) {
			doRegister();
		} else {
			showError("Preencha os campos em vermelho");
		}
	};
};

export default angular.module("app.signup", [authService]).component("signup", {
	template,
	controller: SignupController,
}).name;
