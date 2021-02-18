import angular from "angular";
import template from "./login.html";

const LoginController = function (AuthService, $state) {
	// const ctrl = this;
	// ctrl.submitted = false;
	// ctrl.credentials = {};
	// ctrl.feedback = {
	// 	message: "",
	// 	showing: false,
	// };
	// const showError = (newMessage) => {
	// 	ctrl.feedback.message = newMessage;
	// 	ctrl.feedback.showing = true;
	// };
	// const handleLoginError = (error) => {
	// 	console.error(error);
	// 	ctrl.loading = false;
	// 	showError("Login ou senha incorretos");
	// };
	// const handleLoginSuccess = () => {
	// 	ctrl.loading = false;
	// 	$state.go("main");
	// };
	// const doLogin = () => {
	// 	ctrl.loading = true;
	// 	AuthService.login(ctrl.credentials)
	// 		.then(handleLoginSuccess)
	// 		.catch(handleLoginError);
	// };
	// ctrl.submitForm = (validForm) => {
	// 	ctrl.submitted = true;
	// 	ctrl.feedback.showing = false;
	// 	if (validForm) {
	// 		doLogin();
	// 	} else {
	// 		showError("Preencha os campos em vermelho");
	// 	}
	// };
};

export default angular.module("app.login", []).component("login", {
	template,
	controller: LoginController,
}).name;
