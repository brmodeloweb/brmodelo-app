angular.module('myapp').factory('AuthService', function($http, $cookies) {
	var authService = {};

	authService.login = function(credentials) {
		return $http
			.post('/users/login', credentials)
			.then(function(res) {
				var user = res.data;
				var today = new Date();
				var expired = new Date(today);
				expired.setDate(today.getDate() + 1);
				$cookies.put('sessionId', user.sessionId, {expires: expired});
				$cookies.put('userId', user.userId, {expires: expired});
				$cookies.put('userName', user.userName, {expires: expired});
				return user;
			});
	};

	authService.logout = function() {
		$cookies.remove('sessionId');
		$cookies.remove('userId');
		$cookies.remove('userName');
	};

	authService.register = function(credentials) {
		return $http
			.post('/users/create', credentials)
			.then(function(res) {
				//implement resp here!!
			});
	};

	authService.isAuthenticated = function() {
		var userId = $cookies.get('userId');
		authService.loggeduser = userId;
		authService.loggeduserName = $cookies.get('userName');
		return !!userId;
	};

	authService.recovery = (email) => {
		return $http
			.post('/users/recovery', {email});
	};

	authService.validateRecovery = (mail, code) => {
		return $http
			.get('/users/recovery/validate', {
				params: { mail, code},
			});
	};

	authService.resetPassword = (mail, code, newPassword) => {
		return $http
			.post('/users/reset', {mail, code, newPassword});
	};

	return authService;
});
