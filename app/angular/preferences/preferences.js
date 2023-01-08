import angular from "angular";
import template from "./preferences.html";
import confirmationModal from "../components/confirmationModal";

const preferencesController = function($translate, AuthService, $state, $filter, $uibModal){
	const ctrl = this;
	ctrl.loading = true;
	ctrl.userAccount = {
		"name": "milton bittencourt",
		"email": "milton@gmail.com"
	}

	const showLoading = (loading) => {
		ctrl.loading = loading;
	};

	ctrl.$onInit = () => {
		showLoading(true);
	};

	ctrl.dropdownOptions = [
		{ name: $filter('translate')("Preferences"), type: 'preferences' },
		{ name: $filter('translate')("Logout"), type: 'logout' }
	];

	ctrl.updateAccount = (newUserName, newUserMail) => {
		console.log(newUserName);
		console.log(newUserMail);
	}

	ctrl.deleteAccount = () => {
		const modalInstance = $uibModal.open({
			animation: true,
			component: "confirmationModal",
			resolve: {
				modalData: () => ({
					title: $filter('translate')("Delete Account"),
					content: $filter('translate')("Are you sure you want to delete your account?"),
					cancelLabel: $filter('translate')("Cancel"),
					confirmLabel: $filter('translate')("Delete"),
				}),
			},
		});

		modalInstance.result.then(() => {
			showLoading(true);
			AuthService.deleteAccount().then(() => {
				showLoading(false);
				AuthService.logout();
				$state.go("login");
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