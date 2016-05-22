angular.module('myapp')
			 .controller("logicController",
				function($scope,
								 $rootScope,
								 $stateParams,
								 ModelAPI,
								 LogicService) {

	$scope.model = LogicService.model;
	$scope.selectedName = LogicService.selectedElement.name;

	$scope.initView = function(){
		LogicService.buildWorkspace($stateParams.modelid, $rootScope.loggeduser);
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

	 $scope.changeName = function(){
		 LogicService.editName($scope.selectedName);
	 }

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


