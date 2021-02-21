import angular from "angular";

const authService = function ($http, $cookies) {
	const service = {};

	service.login = function (credentials) {
		return $http.post("http://localhost:3000/users/login", credentials).then(function (res) {
			const user = res.data;
			const today = new Date();
			const expired = new Date(today);
			expired.setDate(today.getDate() + 1);
			$cookies.put("sessionId", user.sessionId, { expires: expired });
			$cookies.put("userId", user.userId, { expires: expired });
			$cookies.put("userName", user.userName, { expires: expired });
			return user;
		});
	};

	service.logout = function () {
		$cookies.remove("sessionId");
		$cookies.remove("userId");
		$cookies.remove("userName");
	};

	service.register = function (credentials) {
		return $http.post("http://localhost:3000/users/create", credentials).then(function (res) {
			// implement resp here!!
		});
	};

	service.isAuthenticated = function () {
		const userId = $cookies.get("userId");
		service.loggeduser = userId;
		service.loggeduserName = $cookies.get("userName");
		return !!userId;
	};

	return service;
};

export default angular
	.module("app.authService", [])
	.factory("AuthService", authService).name;
