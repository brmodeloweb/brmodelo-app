var registerController = function($state, AuthService, $scope) {
	var self = this;
	self.submitted = false;
	self.feedback = {
		message: "",
		showing: false
	}
	self.credentials = {
		username: '',
		email: '',
		password: ''
	};

	self.submitForm = function(validForm) {
		self.submitted = true;
		self.feedback.showing = false;
		if (validForm) {
			doRegister();
		} else {
			showError("Preencha os campos em vermelho");
		}
	};

	function doRegister(){
		$scope.showLoading(true);
		AuthService.register(self.credentials).then(
			function(user) {
				$scope.showLoading(false);
				$state.go('main');
			}, function(error) {
				$scope.showLoading(false);
				showError("Email já cadastrado");
		});
	}

	function showError(newMessage){
		self.feedback.message = newMessage;
		self.feedback.showing = true;
	}

};

angular.module('myapp').controller('registerController', registerController);
