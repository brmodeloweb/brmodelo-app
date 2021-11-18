import angular from "angular";
import confirmationModal from "../components/confirmationModal";

const preventExitService = ($uibModal) => {
	const __handleBeforeUnload = (scope) => (event) => {
		if (scope.modelState.isDirty) return "";
		event.stopPropagation();
	};

	const __handleTransitionStart = (scope, name) => async (trans) => {
		if (trans.from().name === name && scope.modelState.isDirty) {
			const modalInstance = $uibModal.open({
				animation: true,
				component: "confirmationModal",
				resolve: {
					modalData: () => ({
						title: "Alterações não salvas",
						content:
							"Você tem alterações não salvas. Tem certeza que deseja sair sem salvar?",
						cancelLabel: "Cancelar",
						confirmLabel: "Sair sem salvar",
					}),
				},
			});

			const result = await modalInstance.result;
			return result;
		}
		return true;
	};

	const __cleanup = (scope) => () => {
		window.onbeforeunload = null;
		// eslint-disable-next-line no-param-reassign
		scope.modelState = {};
	};

	return {
		handleBeforeUnload: __handleBeforeUnload,
		handleTransitionStart: __handleTransitionStart,
		cleanup: __cleanup,
	};
};

export default angular
	.module("app.preventExit", [confirmationModal])
	.factory("preventExitService", preventExitService).name;
