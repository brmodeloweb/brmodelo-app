const LoginController = (AuthService, $state) => {
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

	const handleLoginError = (error) => {
		console.error(error);
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

angular.module("myapp").component("login", {
	templateUrl: "angular/login/login.html",
	controller: LoginController,
});
