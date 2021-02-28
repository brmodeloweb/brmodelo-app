import angular from "angular";
import authService from "../service/authService";
import modelAPI from "../service/modelAPI";
import template from "./workspace.html";
import deleteModelModalController from "../controller/modal/deleteModelModalController";
import duplicateModelModalController from "../controller/modal/duplicateModelModalController";
import renameModelModalController from "../controller/modal/renameModelModalController";
import newModelModalController from "../controller/modal/newModelModalController";

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

	const openModel = (model) => {
		if (model.type === "logic") {
			return $state.go("logic", {
				references: { modelid: model._id, conversionId: "" },
			});
		}
		$state.go(model.type, {
			modelid: model._id,
		});
	};

	ctrl.$onInit = () => {
		showLoading(true);
		ModelAPI.getAllModels($rootScope.loggeduser).then((models) => {
			console.log(models);
			ctrl.models = [...mapListData(models.data)];
			showLoading(false);
		});
	};

	ctrl.newModel = () => {
		const modalInstance = $uibModal.open({
			animation: true,
			templateUrl: "angular/view/modal/newModelModal.html",
			controller: "ModelModalController",
		});
		modalInstance.result.then((model) => {
			ModelAPI.saveModel(model).then((newModel) => {
				openModel(newModel);
			});
		});
	};

	ctrl.deleteModel = (model) => {
		const modalInstance = $uibModal.open({
			animation: true,
			templateUrl: "angular/view/modal/deleteModelModal.html",
			controller: "DeleteModalController",
		});
		modalInstance.result.then(() => {
			doDelete(model);
		});
	};

	ctrl.renameModel = (model) => {
		const modalInstance = $uibModal.open({
			animation: true,
			templateUrl: "angular/view/modal/renameModelModal.html",
			controller: "RenameModelModalController",
		});
		modalInstance.result.then((newName) => {
			ModelAPI.renameModel(model._id, newName).then((resp) => {
				if (resp.status === 200) {
					model.name = newName;
				}
				showLoading(false);
			});
		});
	};

	ctrl.duplicateModel = (model) => {
		const modalInstance = $uibModal.open({
			animation: true,
			template: '<model-duplicator-modal suggested-name="$ctrl.suggestedName" close="$close(result)" dismiss="$dismiss(reason)"></model-duplicator-modal>',
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
		newModelModalController,
		deleteModelModalController,
		duplicateModelModalController,
		renameModelModalController,
	])
	.component("workspace", {
		template,
		controller: ListController,
	}).name;
