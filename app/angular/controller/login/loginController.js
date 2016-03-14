angular.module('myapp').controller('LoginController', function($scope, $rootScope, AuthService , $state, $cookies) {

	$scope.credentials = {
		username: '',
		password: ''
	};

	$scope.config = {
		submitted: false,
		validmail: false,
		validpassword: false,
		usernotfound: false
	}

	$scope.animationsEnabled = true;

	$scope.login = function(credentials) {
		cleanValidations();
		$scope.config.submitted = true;

		isValidPassword(credentials.password);
		isValidEmail(credentials.username);

		if ($scope.config.validmail && $scope.config.validpassword) {
			AuthService.login(credentials).then(function(user) {
				$state.go('main');
			}, function(error) {
				$scope.config.usernotfound = true;
			});
		}
	};

	$scope.register = function() {
		$state.go('register');
	};

	$scope.toggleAnimation = function() {
		$scope.animationsEnabled = !$scope.animationsEnabled;
	};

	function cleanValidations() {
		$scope.config.validmail = false;
		$scope.config.validpassword = false;
		$scope.configusernotfound = false;
	}

	function isValidPassword(pass) {
		if ((pass.length > 3)) {
			$scope.config.validpassword = true;
			return true;
		} else {
			$scope.config.validpassword = false;
			return false;
		}
	}

	function isValidEmail(field) {
		var re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		if (!re.test(field)) {
			$scope.config.validmail = false;
			return false;
		} else {
			$scope.config.validmail = true;
			return true;
		}
	}
});