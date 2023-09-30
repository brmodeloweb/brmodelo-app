import angular from "angular";
import template from "./preferences.html";
import confirmationModal from "../components/confirmationModal";

const preferencesController = function(AuthService, $state, $filter, $uibModal, $timeout){
	const ctrl = this;
	ctrl.loading = false;
	ctrl.feedback = {
		message: "",
		showing: false
	}

	ctrl.showFeedback = (show, newMessage) => {
		$timeout(() => {
			ctrl.feedback.showing = show;
			ctrl.feedback.message = $filter('translate')(newMessage);
		});
	}

	const showLoading = (loading) => {
		ctrl.loading = loading;
	};

	const handleDeleteAccountError = (error) => {
		if(error.status == 400) {
			const errorMessage = $filter('translate')("Delete account model error");
			ctrl.showFeedback(true, errorMessage);
		} else {
			const errorMessage = $filter('translate')("Delete account default error");
			ctrl.showFeedback(true, errorMessage);
		}
	}

	ctrl.dropdownOptions = [
		{ name: $filter('translate')("Preferences"), type: 'preferences' },
		{ name: $filter('translate')("Logout"), type: 'logout' }
	];

	ctrl.deleteAccount = () => {
		const modalInstance = $uibModal.open({
			animation: true,
			component: "confirmationModal",
			resolve: {
				modalData: () => ({
					title: $filter('translate')("Delete account"),
					content: $filter('translate')("Are you sure you want to delete your account?"),
					cancelLabel: $filter('translate')("Cancel"),
					confirmLabel: $filter('translate')("Delete"),
				}),
			},
		});

		modalInstance.result.then(() => {
			showLoading(true);
			AuthService.deleteAccount().then(() => {
				AuthService.logout();
				$state.go("login");
			}).catch(handleDeleteAccountError)
			.finally(() => {
				showLoading(false);
			});
		});
	}

	ctrl.menuOptionSelected = (option) => {
		switch(option.type) {
			case "logout":  ctrl.doLogout()
				break;
			case "preferences":  $state.go("preferences");
				break;
		}
	}

	ctrl.doLogout = () => {
		AuthService.logout();
		$state.go("login");
	}
}

export default angular
	.module("app.preferences", [confirmationModal])
	.component("preferences", {
		template,
		controller: preferencesController,
	}).name;