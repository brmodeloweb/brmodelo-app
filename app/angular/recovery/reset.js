import angular from "angular";
import template from "./reset.html";
import AuthService from "../service/authService"

const controller = function (AuthService, $stateParams, $timeout, $state) {
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
		if (validForm) {
			if (newPassword != repeatedPassword) {
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
					showFeedback("Código de recuperação de senha é inválido, solicite a recuperação de senha novamente!");
				}
			}).catch((error) => {
				setLoading(false);
				showFeedback("Código de recuperação de senha é inválido, solicite a recuperação de senha novamente!");
			});
	}

};

export default angular
	.module("app.reset", [AuthService])
	.component("resetPassword", {
		template,
		controller,
	}).name;
