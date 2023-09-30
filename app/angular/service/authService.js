import angular from "angular";
import { Buffer } from 'buffer';

const authService = function ($http, $cookies) {
	const service = {};

	service.login = function (credentials) {
		const body = {
			"username": service.encode(credentials.username),
			"password": service.encode(credentials.password)
		}
		return $http.post("/users/login", body).then((res) => {
			const user = res.data;
			const today = new Date();
			const expired = new Date(today);
			expired.setDate(today.getDate() + 1);
			$cookies.put("sessionId", user.sessionId, { expires: expired });
			$cookies.put("userId", user.userId, { expires: expired });
			$cookies.put("userName", user.userName, { expires: expired });
			$cookies.put("userToken", user.token, { expires: expired });
			return user;
		});
	};

	service.logout = function () {
		$cookies.remove("sessionId");
		$cookies.remove("userId");
		$cookies.remove("userName");
		$cookies.remove("userToken");
	};

	service.register = function (credentials) {
		const body = {
			"email": service.encode(credentials.email),
			"password": service.encode(credentials.password)
		}
		return $http.post("/users/create", body).then((res) => {});
	};

	service.isAuthenticated = function () {
		const userId = $cookies.get("userId");
		service.loggeduser = userId;
		service.loggeduserName = $cookies.get("userName");
		service.token = $cookies.get("userToken");
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
			"mail": service.encode(mail),
			"newPassword": service.encode(newPassword),
			"code": code
		}
		return $http.post("/users/reset", body);
	};

	service.deleteAccount = () => {
		return $http({
			method: 'delete',
			url: '/users/delete',
			data: {
				"userId": service.loggeduser
			},
			headers: {
				'Content-type': 'application/json;charset=utf-8'
			}
		});
	};

	service.encode = (data) => {
		return Buffer.from(data).toString('base64');
	};

	return service;
};

export default angular
	.module("app.authService", [])
	.factory("AuthService", authService).name;
