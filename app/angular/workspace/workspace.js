import angular from "angular";
import authService from "../service/authService";
import modelAPI from "../service/modelAPI";
import template from "./workspace.html";
import modelCreateComponent from "../components/createModelModal";
import modelDuplicatorComponent from "../components/duplicateModelModal";
import modelDeleterComponent from "../components/deleteModelModal";
import modelRenameComponent from "../components/renameModelModal";

const ListController = function (
	$state,
	$rootScope,
	$uibModal,
	AuthService,
	ModelAPI,
) {
	const ctrl = this;
	ctrl.loading = false;
	ctrl.models = [];

	const showLoading = (loading) => {
		ctrl.loading = loading;
	};

	const mapListData = (models) => {
		return models.map((model) => {
			if (model.type == "conceptual") {
				model.typeName = "Conceitual";
			} else {
				model.typeName = "Lógico";
			}
			model.authorName = AuthService.loggeduserName;
			return model;
		});
	};

	const doDelete = (model) => {
		showLoading(true);
		ModelAPI.deleteModel(model._id).then((resp) => {
			if (resp.status === 200) {
				ctrl.models.splice(ctrl.models.indexOf(model), 1);
			}
			showLoading(false);
		});
	};

	ctrl.$onInit = () => {
		showLoading(true);
		ModelAPI.getAllModels($rootScope.loggeduser).then((models) => {
			ctrl.models = [...mapListData(models.data)];
			showLoading(false);
		});
	};

	ctrl.openModel = (model) => {
		console.log(model);
		if (model.type === "logic") {
			return $state.go("logic", {
				references: { modelid: model._id, conversionId: "" },
			});
		}
		$state.go(model.type, {
			modelid: model._id,
		});
	};

	ctrl.newModel = () => {
		const modalInstance = $uibModal.open({
			animation: true,
			template: '<create-model-modal close="$close(result)" dismiss="$dismiss()"></create-model-modal>',
		});
		modalInstance.result.then((model) => {
			showLoading(true);
			ModelAPI.saveModel(model).then((newModel) => {
				ctrl.openModel(newModel);
				showLoading(false);
			});
		});
	};

	ctrl.renameModel = (model) => {
		const modalInstance = $uibModal.open({
			animation: true,
			template: '<rename-model-modal close="$close(result)" dismiss="$dismiss(newName)"></rename-model-modal>',
		});
		modalInstance.result.then((newName) => {
			showLoading(true);
			ModelAPI.renameModel(model._id, newName).then((resp) => {
				if (resp.status === 200) {
					model.name = newName;
				}
				showLoading(false);
			});
		});
	};

	ctrl.deleteModel = (model) => {
		const modalInstance = $uibModal.open({
			animation: true,
			template: '<delete-model-modal close="$close(result)" dismiss="$dismiss(reason)"></delete-model-modal>',
		});
		modalInstance.result.then(() => {
			doDelete(model);
		});
	};

	ctrl.logout = () => {
		AuthService.logout();
		$state.go("login");
	}

	ctrl.duplicateModel = (model) => {
		const modalInstance = $uibModal.open({
			animation: true,
			template: '<duplicate-model-modal suggested-name="$ctrl.suggestedName" close="$close(result)" dismiss="$dismiss(reason)"></duplicate-model-modal>',
			controller: function() {
				const $ctrl = this;
				$ctrl.suggestedName = `${model.name} (cópia)`;
			},
			controllerAs: '$ctrl',
		});
		modalInstance.result.then((newName) => {
			showLoading(true);
			const duplicatedModel = {
				id: "",
				name: newName,
				type: model.type,
				model: model.model,
				user: model.who,
			};
			ModelAPI.saveModel(duplicatedModel).then((newModel) => {
				ctrl.models.push(newModel);
				showLoading(false);
			});
		});
	};
};

export default angular
	.module("app.workspace", [
		'ui.bootstrap',
		authService,
		modelAPI,
		modelCreateComponent,
		modelDuplicatorComponent,
		modelDeleterComponent,
		modelRenameComponent
	])
	.component("workspace", {
		template,
		controller: ListController,
	}).name;
