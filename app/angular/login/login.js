import angular from "angular";
import newModelModalController from "../controller/modal/newModelModalController";
import authService from "../service/authService";
import template from "./login.html";

const LoginController = function (AuthService, $state, $uibModal) {
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
	ctrl.submitForm = (validForm) => {
		ctrl.submitted = true;
		ctrl.feedback.showing = false;
		if (validForm) {
			doLogin();
		} else {
			showError("Preencha os campos em vermelho");
		}
	};

	ctrl.openModal = () => {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'angular/view/modal/newModelModal.html',
			controller:  'ModelModalController'
		});

		modalInstance.result.then(function (model) {
			ModelAPI.saveModel(model).then(function(newModel){
				self.openModel(newModel);
			});
		});
	}
};

export default angular.module("app.login", [authService, newModelModalController]).component("login", {
	template,
	controller: LoginController,
}).name;
