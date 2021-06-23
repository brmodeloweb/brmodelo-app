const RecoveryController = function (AuthService) {
	const ctrl = this;
	ctrl.submitted = false;
	ctrl.mail = "";
	ctrl.feedback = {
		message: "",
		showing: false,
		type: "error"
	};

	const showFeedback = (newMessage, type = "error") => {
		ctrl.feedback.message = newMessage;
		ctrl.feedback.showing = true;
		ctrl.feedback.type = type;
	};

	const handleError = (error) => {
		ctrl.loading = false;
		if(error.status == 400) {
			showFeedback("Esse email ainda não está cadastrado.");
		} else {
			showFeedback("Ops, tivemos um erro interno, por favor tente novamente mais tarde...");
		}
	};

	const handleSuccess = () => {
		ctrl.loading = false;
		showFeedback(`Um email com instruções foi enviado para ${ctrl.mail}`, "success");
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
