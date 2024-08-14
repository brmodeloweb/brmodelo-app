import angular from "angular";
import template from "./logic.html";
import sqlGeneratorService from "../service/sqlGeneratorService";
import sqlGeneratorModal from "../components/sqlGeneratorModal";
import duplicateModelModal from "../components/duplicateModelModal";
import shareModelModal from "../components/shareModelModal";
import queryExpressionModal from "../components/queryExpressionModal";
import sqlComparasionDropdown from "../components/sqlComparasionDropdown";
import statusBar from "../components/statusBar";
import preventExitServiceModule from "../service/preventExitService";
import view from "../view/view";
import columnForm from "./columnForm";
import checkConstraint from "./checkConstraint";
import sidebarControlLogical from "./sidebarControl";
import iconLogic from  "../components/icons/logic";
import supportBannersList from "../components/supportBannersList";

const controller = function (
	$rootScope,
	$stateParams,
	ModelAPI,
	LogicService,
	$uibModal,
	$state,
	$timeout,
	SqlGeneratorService,
	$filter,
	preventExitService,
	$transitions
) {

	const ctrl = this;

	ctrl.modelState = {
		isDirty: false,
		updatedAt: new Date(),
	};
	ctrl.model = LogicService.model;
	ctrl.selectedName = "";
	ctrl.selectedElement = null;
	ctrl.columns = [];
	ctrl.editionVisible = true;
	ctrl.tableNames = [];
	ctrl.mapTables = {};

	ctrl.selectedLink = null;

	ctrl.addColumnVisible = false;
	ctrl.editColumnVisible = false;

	ctrl.feedback = {
		message: "",
		showing: false,
		type: "success"
	}

	ctrl.print = function () {
		window.print();
	}

	const setIsDirty = (isDirty) => {
		ctrl.modelState.isDirty = isDirty;
	};

	ctrl.$onInit = () => {
		ctrl.setLoading(true);
		LogicService.buildWorkspace($stateParams.references.modelid, $rootScope.loggeduser, ctrl.stopLoading, $stateParams.references.conversionId);
	}

	ctrl.showFeedback = function (newMessage, show, type) {
		ctrl.feedback.message = $filter('translate')(newMessage);
		ctrl.feedback.showing = show;
		ctrl.feedback.type = type;
	}

	ctrl.stopLoading = function () {
		ctrl.setLoading(false);
	}

	ctrl.saveModel = function () {
		setIsDirty(false);
		ctrl.modelState.updatedAt = new Date();
		LogicService.updateModel().then(function (res) {
			ctrl.showFeedback("Successfully saved!", true, "success");
		});
	}

	ctrl.setLoading = (show) => {
		$timeout(() => {
			ctrl.loading = show;
		});
	}

	$rootScope.$on('clean:logic:selection', function () {
		ctrl.showFeedback("", false);
	});

	$rootScope.$on('element:select', function (event, element) {
		$timeout(() => {
			ctrl.selectedLink = null;
			ctrl.selectedElement = element;
		});
	});

	$rootScope.$on('note:select', function (event, element) {
		$timeout(() => {
			ctrl.selectedLink = null;
			const type = element.model.attributes.type;
			const value = element.model.attributes.attrs.text.text;
			ctrl.selectedElement = {"value": value, "type": type, "element": element};
		});
	});

	$rootScope.$on('columns:select', function (event, columns) {
		$timeout(() => {
			ctrl.addColumnVisible = false;
			ctrl.columns = [];
			if(columns != null) {
				for (var i = 0; i < columns.length; i++) {
					columns[i].expanded = false;
					ctrl.columns.push(columns[i]);
				}
				ctrl.columns = columns;
			}
		});
	});

	$rootScope.$on('element:update', function (event, element) {
		$timeout(() => {
			if(element != null && element.update != null) {
				element.update();
			}
			if(element != null && element.resize != null) {
				element.resize();
			}
			element.updateSize();
		});
	});

	$rootScope.$on('model:saved', () => {
		setIsDirty(false);
		ctrl.modelState.updatedAt = new Date();
		$timeout(() => {
			ctrl.showFeedback("Successfully saved!", true, "success");
		});
	});

	$rootScope.$on('link:select', function (event, selectedLink) {
		$timeout(() => {
			ctrl.selectedElement = null;
			ctrl.selectedLink = selectedLink;
		});
	});

	$rootScope.$on("element:isDirty", function () {
		setIsDirty(true);
	});

	$rootScope.$on("model:loaded", function (_, model) {
		ctrl.modelState.updatedAt = model.updated ?? new Date();
	});

	$rootScope.$on("model:loaderror", function (_, error) {
		if(error.status == 404 || error.status == 401) {
			$state.go("noaccess");
		}
	});

	$rootScope.$on("model:warning-copy", function () {
		$timeout(() => {
			ctrl.showFeedback("Copy is not allowed on this module when element has references.", true, "warning");
		});
	});

	ctrl.updateCardA = function (card) {
		LogicService.editCardinalityA(card);
	}

	ctrl.updateCardB = function (card) {
		LogicService.editCardinalityB(card);
	}

	ctrl.undoModel = function () {
		LogicService.undo();
	}

	ctrl.redoModel = function () {
		LogicService.redo();
	}

	ctrl.zoomIn = function () {
		LogicService.zoomIn();
	}

	ctrl.zoomOut = function () {
		LogicService.zoomOut();
	}

	ctrl.zoomNone = function () {
		LogicService.zoomNone();
	}

	ctrl.generateSQL = function () {
		const sql = SqlGeneratorService.generate(LogicService.buildTablesJson(), LogicService.loadViews());

		$uibModal.open({
			animation: true,
			template: '<sql-generator-modal sql="$ctrl.sql" close="$close(result)" dismiss="$dismiss(reason)"></sql-generator-modal>',
			controller: function () {
				const $ctrl = this;
				$ctrl.sql = sql;
			},
			controllerAs: '$ctrl',
		});
	}

	ctrl.duplicateModel = (model) => {
		const modalInstance = $uibModal.open({
			animation: true,
			template: `<duplicate-model-modal
						suggested-name="$ctrl.suggestedName"
						close="$close(result)"
						dismiss="$dismiss(reason)"
						user-id=$ctrl.userId
						model-id=$ctrl.modelId>
					</duplicate-model-modal>`,
			controller: function() {
				const $ctrl = this;
				$ctrl.suggestedName = $filter('translate')("MODEL_NAME (copy)", { name: model.name });
				$ctrl.modelId = model.id;
				$ctrl.userId = model.user;
			},
			controllerAs: '$ctrl',
		}).result;
		modalInstance.then((newModel) => {
			window.open($state.href('logic', { references: { 'modelid': newModel._id } }));
			ctrl.showFeedback("Successfully duplicated!", true, 'success');
		}).catch(error => {
			console.error(error);
		});
	};

	ctrl.shareModel = (model) => {
		const modalInstance = $uibModal.open({
			animation: true,
			backdrop: 'static',
			keyboard: false,
			template: '<share-model-modal close="$close(result)" dismiss="$dismiss()" model-id="$ctrl.modelId"></share-model-modal>',
			controller: function() {
				const $ctrl = this;
				$ctrl.modelId = model.id;
			},
			controllerAs: '$ctrl',
		}).result;
		modalInstance.then(() => {
			ctrl.showFeedback($filter('translate')("Sharing configuration has been updated successfully!"), true, "success");
		}).catch((reason) => {
			console.log("Modal dismissed with reason", reason);
		});
	};

	window.onbeforeunload = preventExitService.handleBeforeUnload(ctrl);

	const onBeforeDeregister = $transitions.onBefore({},
		preventExitService.handleTransitionStart(ctrl, "logic")
	);

	const onExitDeregister = $transitions.onExit({}, preventExitService.cleanup(ctrl));

	ctrl.$onDestroy = () => {
		LogicService.unbindAll();
		onBeforeDeregister();
		preventExitService.cleanup(ctrl)();
		onExitDeregister();
	};
};

export default angular
	.module("app.workspace.logic", [
		sqlGeneratorService,
		sqlGeneratorModal,
		duplicateModelModal,
		preventExitServiceModule,
		statusBar,
		view,
		columnForm,
		sidebarControlLogical,
		checkConstraint,
		queryExpressionModal,
		sqlComparasionDropdown,
		shareModelModal,
		iconLogic,
		supportBannersList
	])
	.component("editorLogic", {
		template,
		controller,
	}).name;