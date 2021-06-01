const RecoveryController = function (AuthService) {
	const ctrl = this;
	ctrl.submitted = false;
	ctrl.mail = "";
	ctrl.feedback = {
		message: "",
		showing: false,
	};

	const showFeedback = (newMessage) => {
		ctrl.feedback.message = newMessage;
		ctrl.feedback.showing = true;
	};

	const handleError = () => {
		ctrl.loading = false;
		showFeedback("Esse email ainda não está cadastrado.");
	};

	const handleSuccess = () => {
		ctrl.loading = false;
		showFeedback(`Um email com instruções foi enviado para ${ctrl.mail}`);
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
			showFeedback("Preencha os campos em vermelho");
		}
	};
};

angular.module("myapp").component("recovery", {
	templateUrl: "angular/recovery/recovery.html",
	controller: RecoveryController,
});
