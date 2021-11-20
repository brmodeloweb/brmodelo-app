import angular from "angular";
import template from "./recovery.html";
import AuthService from "../service/authService"

const controller = function (AuthService, $filter) {
	const ctrl = this;
	ctrl.submitted = false;
	ctrl.mail = "";
	ctrl.feedback = {
		message: "",
		showing: false,
		type: "error"
	};

	const showFeedback = (newMessage, type = "error") => {
		ctrl.feedback.message = $filter('translate')(newMessage);
		ctrl.feedback.showing = true;
		ctrl.feedback.type = type;
	};

	const handleError = (error) => {
		ctrl.loading = false;
		if(error.status == 400) {
			showFeedback("This email is not registered yet.");
		} else {
			showFeedback("Ops, we had an internal error, please try again later...");
		}
	};

	const handleSuccess = () => {
		ctrl.loading = false;
		showFeedback($filter('translate')('An email with instructions has been sent to EMAIL', { email: ctrl.mail }), "success");
	};

	const doRecover = () => {
		ctrl.loading = true;
		AuthService.recovery(ctrl.mail)
			.then(handleSuccess)
			.catch(handleError);
	};

	ctrl.submitForm = (validForm) => {
		ctrl.submitted = true;
		ctrl.feedback.showing = false;
		if (validForm) {
			doRecover();
		} else {
			showFeedback("Fill the fields in red");
		}
	};
};


export default angular
	.module("app.recovery", [AuthService])
	.component("recovery", {
		template,
		controller,
	}).name;
