angular.module('myapp')
			 .controller("logicController",
				function($scope,
								 $rootScope,
								 $stateParams,
								 ModelAPI,
								 LogicService,
								 SqlGeneratorService) {

	var self = this;

	$scope.model = LogicService.model;
	$scope.selectedName = "";
	$scope.selectedElement = null;
	$scope.columns = [];
	$scope.editionVisible = false;
	$scope.tableNames = [];
	self.mapTables = {};

	$scope.selectedLink = null;

	$scope.addColumnVisible = false;
	$scope.editColumnVisible = false;

	$scope.feedback = {
		message: "",
		showing: false,
		type: "success"
	}

	$scope.initView = function(){
		$scope.showLoading(true);
		LogicService.buildWorkspace($stateParams.modelid, $rootScope.loggeduser, self.stopLoading, $stateParams.conversionId);
	}

	self.closeAllColumns = function(){
		for (var i = 0; i < $scope.columns.length; i++) {
			$scope.columns[i].expanded = false;
		}
	}

	$scope.showFeedback =  function(newMessage, show, type){
		$scope.feedback.message = newMessage;
		$scope.feedback.showing = show;
		$scope.feedback.type = type;
	}

	self.stopLoading = function () {
		$scope.showLoading(false);
	}

	$scope.saveModel = function() {
		LogicService.updateModel().then(function(res){
			$scope.showFeedback("Salvo com sucesso!", true, "success");
		});
	}

	$scope.$on('clean:logic:selection', function(){
		$scope.showFeedback("",false);
		$scope.$apply();
	});

	$scope.$on('element:select', function(event, element) {
		$scope.selectedLink = null;
		$scope.selectedElement = element;
		if(element != null) {
			$scope.selectedName = element.attributes.name;
		}
		$scope.$apply();
	});

	$scope.$on('columns:select', function(event, columns) {
		$scope.addColumnVisible = false;
		$scope.columns = [];
		for (var i = 0; i < columns.length; i++) {
			columns[i].expanded = false;
			$scope.columns.push(columns[i]);
		}
		$scope.columns = columns;
	});

	$scope.$on('link:select', function(event, selectedLink) {
		$scope.selectedElement = null;
		$scope.selectedLink = selectedLink;
		$scope.$apply();
	});

	$scope.updateCardA = function(card) {
		LogicService.editCardinalityA(card);
	}

	$scope.updateCardB = function(card) {
		LogicService.editCardinalityB(card);
	}

	$scope.changeName = function(){
	 if($scope.selectedName != null && $scope.selectedName != "") {
		 LogicService.editName($scope.selectedName);
	 }
	}

	$scope.deleteColumn = function(column, $index){
	 LogicService.deleteColumn($index);
	}

	$scope.editionColumnMode = function(column) {
	 $scope.editColumnModel = JSON.parse(JSON.stringify(column));

	 self.closeAllColumns();

	 column.expanded = true;
	 //LogicService.editColumn($index);
	}

	 $scope.editColumn = function(oldColumn, editedColumn, $index) {
		if(editedColumn.name == ""){
			$scope.showFeedback("NOME de coluna não pode ficar em branco!", true, "error");
			return;
		}

		// if(editedColumn.FK && editedColumn.tableOrigin.idName == "") {
		// 	 $scope.showFeedback("Selecione a origem da tabela estrangeira!", true, "error");
		// 	 return;
		// } else {
		// 	column.tableOrigin.idOrigin = self.mapTables.get(column.tableOrigin.idName);
		// }

		LogicService.editColumn($index, editedColumn);

		self.closeAllColumns();
	 }

	 $scope.addColumn = function(column){
		 if(column.name == "") {
			$scope.showFeedback("NOME de coluna não pode ficar em branco!", true, "error");
			return;
		 }

		 if(column.FK && column.tableOrigin.idName == "") {
				$scope.showFeedback("Selecione a origem da tabela estrangeira!", true, "error");
				return;
		 } else {
			 column.tableOrigin.idOrigin = self.mapTables.get(column.tableOrigin.idName);
		 }

		 LogicService.addColumn(column);
		 $scope.addColumnModel = self.newColumnObject();
		 $scope.addColumnVisible = false;
	 }

	 $scope.showAddColumn = function(show){
		$scope.addColumnVisible = show;
		$scope.addColumnModel = self.newColumnObject();

		$scope.tableNames = [];
		self.mapTables = LogicService.getTablesMap();
		for (var key of self.mapTables.keys()) {
			$scope.tableNames.push(key);
		}
	 }

	$scope.selectAddType = function(type){
		if(!$scope.addColumnModel.PK && !$scope.addColumnModel.FK) {
			$scope.addColumnModel.type = type;
		} else {
			$scope.addColumnModel.type = "INTEGER";
		}
	}

	$scope.selectEditType = function(type){
		$scope.editColumnModel.type = type;
	}

	$scope.selectAddTableOrigin = function(originName){
		$scope.addColumnModel.tableOrigin.idName = originName;
	}

	self.newColumnObject = function() {
		return {
			"FK": false,
			"PK": false,
			"name": "",
			"tableOrigin": {
				"idOrigin" : null,
				"idLink" : null,
				"idName" : ""
			},
			"type": "INTEGER"
		};
	}

	$scope.addColumnModel = self.newColumnObject();
	$scope.editColumnModel = self.newColumnObject();

	$scope.undoModel = function(){
		LogicService.undo();
	}

	$scope.redoModel = function(){
		LogicService.redo();
	}

	$scope.zoomIn = function(){
		LogicService.zoomIn();
	}

	$scope.zoomOut = function(){
		LogicService.zoomOut();
	}

	$scope.generateSQL = function(){
		console.log(SqlGeneratorService.generate(LogicService.buildTablesJson()));
	}

});
