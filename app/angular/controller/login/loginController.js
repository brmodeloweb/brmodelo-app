var LoginController = function(AuthService, $state) {
	var self = this;
	self.submitted = false;
	self.credentials = {}
	self.feedback = {
		message: "",
		showing: false
	}

	self.submitForm = function(validForm) {
		self.submitted = true;
		self.feedback.showing = false;
		if (validForm) {
			doLogin();
		} else {
			showError("Preencha os campos em vermelho");
		}
	}

	function doLogin(){
		AuthService.login(self.credentials).then(
			function(user) {
				$state.go('main');
			}, function(error) {
				showError("Login ou senha incorretos");
		});
	}

	function showError(newMessage){
		self.feedback.message = newMessage;
		self.feedback.showing = true;
	}
};

angular.module('myapp').controller('LoginController', LoginController);
