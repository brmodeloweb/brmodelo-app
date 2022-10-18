import angular from "angular";
import { Buffer } from 'buffer';

const authService = function ($http, $cookies) {
	const service = {};

	service.login = function (credentials) {
		const body = {
			"username": Buffer.from(credentials.username).toString('base64'),
			"password": Buffer.from(credentials.password).toString('base64')
		}
		return $http.post("/users/login", body).then((res) => {
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
		const body = {
			"email": Buffer.from(credentials.email).toString('base64'),
			"password": Buffer.from(credentials.password).toString('base64')
		}
		return $http.post("/users/create", body).then((res) => {});
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
		const body = {
			"mail": Buffer.from(mail).toString('base64'),
			"newPassword": Buffer.from(newPassword).toString('base64'),
			"code": code
		}
		return $http.post("/users/reset", body);
	};

	return service;
};

export default angular
	.module("app.authService", [])
	.factory("AuthService", authService).name;
