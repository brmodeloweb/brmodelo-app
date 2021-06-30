import angular from "angular";

const authService = function ($http, $cookies) {
	const service = {};

	service.login = function (credentials) {
		return $http.post("/users/login", credentials).then(function (res) {
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
		return $http.post("/users/create", credentials).then(function (res) {
			// implement resp here!!
		});
	};

	service.isAuthenticated = function () {
		const userId = $cookies.get("userId");
		service.loggeduser = userId;
		service.loggeduserName = $cookies.get("userName");
		return !!userId;
	};

	service.recovery = (email) => {
		return $http.post("/users/recovery", { email });
	};

	service.validateRecovery = (mail, code) => {
		return $http.get("/users/recovery/validate", {
			params: { mail, code },
		});
	};

	service.resetPassword = (mail, code, newPassword) => {
		return $http.post("/users/reset", { mail, code, newPassword });
	};

	return service;
};

export default angular
	.module("app.authService", [])
	.factory("AuthService", authService).name;
