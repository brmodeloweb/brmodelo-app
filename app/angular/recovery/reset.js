import angular from "angular";
import template from "./reset.html";
import AuthService from "../service/authService"
import bugReportButton from "../components/bugReportButton";

const controller = function (AuthService, $stateParams, $timeout, $state, $filter) {
	const ctrl = this;
	ctrl.submitted = false;
	ctrl.mail = "";
	ctrl.validation = {
		validCode: false,
	}
	ctrl.feedback = {
		message: "",
		showing: false,
		type: "error"
	};

	const setValidation = (valid) => {
		$timeout(() => {
			ctrl.validation.validCode = valid;
		}, 100);
	};

	const setLoading = (loading) => {
		$timeout(() => {
			ctrl.loading = loading;
		}, 100);
	};

	const showFeedback = (newMessage, type = "error") => {
		$timeout(() => {
			ctrl.feedback.message = $filter('translate')(newMessage);
			ctrl.feedback.showing = true;
			ctrl.feedback.type = type;
		}, 100);
	};

	const handleError = (error) => {
		console.log(error);
		ctrl.loading = false;
		showFeedback("This email is not registered yet.");
	};

	const handleSuccess = () => {
		showFeedback("The new password was successfully saved.", "success");
		$timeout(() => {
			setLoading(false);
			$state.go("login");
		}, 2000);
	};

	const doReset = (newPassword) => {
		ctrl.loading = true;
		const code = $stateParams.code;
		const mail = $stateParams.mail;
		AuthService.resetPassword(mail, code, newPassword)
			.then(handleSuccess)
			.catch(handleError);
	};

	ctrl.submitForm = (validForm, newPassword, repeatedPassword) => {
		ctrl.submitted = true;
		ctrl.feedback.showing = false;
		if (validForm) {
			if (newPassword != repeatedPassword) {
				showFeedback("The password must be the same in both fields.");
			} else if (newPassword.length < 6) {
				showFeedback("The password must contain more than 6 digits.");
			} else {
				doReset(newPassword)
			}
		} else {
			showFeedback("Fill the fields in red");
		}
	};

	ctrl.$onInit = () => {
		setLoading(true);
		const code = $stateParams.code;
		const mail = $stateParams.mail;
		setLoading(true);
		AuthService.validateRecovery(mail, code)
			.then((response) => {
				setLoading(false);
				if (response.data.valid) {
					setValidation(true);
				} else {
					showFeedback("Password recovery code is invalid, request password recovery again!");
				}
			}).catch((error) => {
				setLoading(false);
				showFeedback("Password recovery code is invalid, request password recovery again!");
			});
	}

};

export default angular
	.module("app.reset", [AuthService, bugReportButton])
	.component("resetPassword", {
		template,
		controller,
	}).name;
