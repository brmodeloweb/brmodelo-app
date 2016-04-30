 var LoginController = function(AuthService, $state) {
	var vm = this;
	vm.submitted = false;
	vm.credentials = {}
 	vm.feedback = {
 		message: "",
 		showing: false
 	}

	vm.submitForm = function(validForm) {
		vm.submitted = true;
		vm.feedback.showing = false;
		if (validForm) {
			doLogin();
		} else {
			showError("Preencha os campos em vermelho");
		}
	}

	function doLogin(){
		AuthService.login(vm.credentials).then(
			function(user) {
				$state.go('main');
			}, function(error) {
				showError("Login ou senha incorretos");
		});
	}

	function showError(newMessage){
		vm.feedback.message = newMessage;
		vm.feedback.showing = true;
	}
};

angular.module('myapp').controller('LoginController', LoginController);