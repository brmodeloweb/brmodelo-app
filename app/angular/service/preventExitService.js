import angular from "angular";
import confirmationModal from "../components/confirmationModal";

const preventExitService = ($uibModal, $filter) => {
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
						title: $filter('translate')("Unsaved changes"),
						content: $filter('translate')("You have unsaved changes. Are you sure you want to exit without saving?"),
						cancelLabel: $filter('translate')("Cancel"),
						confirmLabel: $filter('translate')("Exit without saving"),
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
