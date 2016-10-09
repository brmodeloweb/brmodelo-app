angular.module('myapp')
			 .controller("logicController",
				function($scope,
								 $rootScope,
								 $stateParams,
								 ModelAPI,
								 LogicService) {

	var self = this;

	$scope.model = LogicService.model;
	$scope.selectedName = LogicService.selectedElement.name;
	$scope.columns = [];
	$scope.editionVisible = true;
	$scope.tableNames = [];
	self.mapTables = {};

	$scope.addColumnVisible = false;

	$scope.feedback = {
		message: "",
		showing: false,
		type: "success"
	}

	$scope.showFeedback =  function(newMessage, show){
		$scope.feedback.message = newMessage;
		$scope.feedback.showing = show;
	}

	self.stopLoading = function () {
		$scope.showLoading(false);
	}

	$scope.initView = function(){
		$scope.showLoading(true);
		LogicService.buildWorkspace($stateParams.modelid, $rootScope.loggeduser, self.stopLoading);
	}

	$scope.saveModel = function() {
		LogicService.updateModel().then(function(res){
			console.log("saved -> show feedback");
		});
	}

	$scope.$on('name:updated', function(event, newName) {
     $scope.selectedName = newName;
		 $scope.$apply();
	 });

	$scope.$on('columns:select', function(event, columns) {
		$scope.addColumnVisible = false;
		$scope.columns = columns;
	//	$scope.$apply();
	});

	 $scope.changeName = function(){
		 LogicService.editName($scope.selectedName);
	 }

	 $scope.deleteColumn = function(column, $index){
		 LogicService.deleteColumn($index);
	 }

	 $scope.editColumn = function($index){
		 LogicService.editColumn($index);
	 }

	 $scope.addColumn = function(column){
		 if(column.name == "") {
			$scope.showFeedback("NOME de coluna não pode ficar em branco!", true);
			return;
		 }

		 if(column.FK && column.tableOrigin.idName == "") {
				$scope.showFeedback("Selecione a origem da tabela estrangeira!", true);
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

	// $scope.undoModel = function(){
	// 	$scope.commandManager.undo();
	// }
	//
	// $scope.redoModel = function(){
	// 	$scope.commandManager.redo();
	// }
	//
	// $scope.zoomIn = function(){
	// 	$scope.paperScroller.zoom(0.2, { max: 2 });
	// }
	//
	// $scope.zoomOut = function(){
	// 	$scope.paperScroller.zoom(-0.2, { min: 0.2 });
	// }

});
