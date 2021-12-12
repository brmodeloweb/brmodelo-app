import angular from "angular";
import template from "./logic.html";
import sqlGeneratorService from "../service/sqlGeneratorService";
import sqlGeneratorModal from "../components/sqlGeneratorModal";
import duplicateModelModal from "../components/duplicateModelModal";
import bugReportButton from "../components/bugReportButton";
import statusBar from "../components/statusBar";
import Column from "../service/Column";
import preventExitServiceModule from "../service/preventExitService";

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

	ctrl.closeAllColumns = function () {
		for (var i = 0; i < ctrl.columns.length; i++) {
			ctrl.columns[i].expanded = false;
		}
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
			ctrl.showFeedback("Saved successfully!", true, "success");
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
			if (element != null) {
				ctrl.selectedName = element.attributes.name;
			}
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
		});
	});

	$rootScope.$on('model:saved', () => {
		setIsDirty(false);
		ctrl.modelState.updatedAt = new Date();
		$timeout(() => {
			ctrl.showFeedback("Saved successfully!", true, "success");
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
		console.log('model', model)
		ctrl.modelState.updatedAt = model.updated ?? new Date();
	});

	ctrl.updateCardA = function (card) {
		LogicService.editCardinalityA(card);
	}

	ctrl.updateCardB = function (card) {
		LogicService.editCardinalityB(card);
	}

	ctrl.changeName = function () {
		if (ctrl.selectedName != null && ctrl.selectedName != "") {
			LogicService.editName(ctrl.selectedName);
		}
	}

	ctrl.deleteColumn = function (column, $index) {
		LogicService.deleteColumn($index);
	}

	ctrl.editionColumnMode = function (column) {
		ctrl.editColumnModel = JSON.parse(JSON.stringify(column));

		ctrl.closeAllColumns();

		column.expanded = true;
		//LogicService.editColumn($index);
	}

	ctrl.editColumn = function (oldColumn, editedColumn, $index) {
		if (editedColumn.name == "") {
			ctrl.showFeedback("The column name cannot be empty!", true, "error");
			return;
		}

		// if(editedColumn.FK && editedColumn.tableOrigin.idName == "") {
		// 	 ctrl.showFeedback("Selecione a origem da tabela estrangeira!", true, "error");
		// 	 return;
		// } else {
		// 	column.tableOrigin.idOrigin = self.mapTables.get(column.tableOrigin.idName);
		// }

		LogicService.editColumn($index, editedColumn);

		ctrl.closeAllColumns();
	}

	ctrl.addColumn = function (column) {
		if (column.name == "") {
			ctrl.showFeedback("The column name cannot be empty!", true, "error");
			return;
		}

		if (column.FK && column.tableOrigin.idName == "") {
			ctrl.showFeedback("Select the foreign table source!", true, "error");
			return;
		} else {
			column.tableOrigin.idOrigin = ctrl.mapTables.get(column.tableOrigin.idName);
		}

		LogicService.addColumn(column);
		ctrl.addColumnModel = ctrl.newColumnObject();
		ctrl.addColumnVisible = false;
	}

	ctrl.showAddColumn = function (show) {
		ctrl.addColumnVisible = show;
		ctrl.addColumnModel = ctrl.newColumnObject();

		ctrl.tableNames = [];
		ctrl.mapTables = LogicService.getTablesMap();
		for (var key of ctrl.mapTables.keys()) {
			ctrl.tableNames.push({"name": key, "type": key});
		}
	}

	ctrl.selectAddType = function (selected) {
		if (!ctrl.addColumnModel.PK && !ctrl.addColumnModel.FK) {
			ctrl.addColumnModel.type = selected.type;
		} else {
			ctrl.addColumnModel.type = "INT";
		}
	}

	ctrl.selectEditType = function (selected) {
		if (!ctrl.editColumnModel.PK && !ctrl.editColumnModel.FK) {
			ctrl.editColumnModel.type = selected.type;
		}
	}

	ctrl.selectAddTableOrigin = function (selected) {
		ctrl.addColumnModel.tableOrigin.idName = selected.name;
	}

	ctrl.newColumnObject = function () {
		return new Column();
	}

	ctrl.addColumnModel = ctrl.newColumnObject();
	ctrl.editColumnModel = ctrl.newColumnObject();

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

	ctrl.changeVisible = function () {
		ctrl.editionVisible = !ctrl.editionVisible;
	}

	ctrl.generateSQL = function () {
		var sql = SqlGeneratorService.generate(LogicService.buildTablesJson());

		console.log(sql);

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

	ctrl.duplicateModel = () => {
		const modalInstance = $uibModal.open({
			animation: true,
			template: '<duplicate-model-modal suggested-name="$ctrl.suggestedName" close="$close(result)" dismiss="$dismiss(reason)"></duplicate-model-modal>',
			controller: function () {
				const $ctrl = this;
				$ctrl.suggestedName = $filter('translate')("MODEL_NAME (copy)", { name: ctrl.model.name });
			},
			controllerAs: '$ctrl',
		});
		modalInstance.result.then((newName) => {
			ctrl.setLoading(true);
			const duplicatedModel = {
				id: "",
				name: newName,
				type: ctrl.model.type,
				model: JSON.stringify(LogicService.graph),
				user: ctrl.model.user,
			};
			ModelAPI.saveModel(duplicatedModel).then((newModel) => {
				window.open($state.href('logic', { references: { 'modelid': newModel._id } }));
				ctrl.showFeedback("Successfully duplicated!", true);
				ctrl.setLoading(false);
			});
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
	.module("app.workspace.logic", [sqlGeneratorService, sqlGeneratorModal, duplicateModelModal, preventExitServiceModule, bugReportButton, statusBar])
	.component("editorLogic", {
		template,
		controller,
	}).name;