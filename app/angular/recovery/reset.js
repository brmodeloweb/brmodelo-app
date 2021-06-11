const ResetPasswordController = function (AuthService, $stateParams, $timeout, $state) {
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
			ctrl.feedback.message = newMessage;
			ctrl.feedback.showing = true;
			ctrl.feedback.type = type;
		}, 100);
	};

	const handleError = (error) => {
		console.log(error);
		ctrl.loading = false;
		showFeedback("Esse email ainda não está cadastrado.");
	};

	const handleSuccess = () => {
		showFeedback(`Nova senha salva com sucesso.`, "success");
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
		console.log(validForm);
		if (validForm) {
			if(newPassword != repeatedPassword) {
				showFeedback("A senha deve ser a mesma nos dois campos");
			} else if (newPassword.length < 6) {
				showFeedback("Senha deve conter mais que 6 dígitos");
			} else {
				doReset(newPassword)
			}
		} else {
			showFeedback("Preencha os campos em vermelho");
		}
	};

	ctrl.$onInit = async () => {
		setLoading(true);
		const code = $stateParams.code;
		const mail = $stateParams.mail;
		try {
			const response = await AuthService.validateRecovery(mail, code);
			setLoading(true);
			if (response.data.valid) {
				setValidation(true);
				setLoading(false);
			} else {
				showFeedback("Código de recuperação de senha é inválido, solicite a recuperação de senha novamente!");
			}
		} catch (error) {
			showFeedback("Código de recuperação de senha é inválido, solicite a recuperação de senha novamente!");
		}
	}

};

angular.module("myapp").component("resetPassword", {
	templateUrl: "angular/recovery/reset.html",
	controller: ResetPasswordController,
});
