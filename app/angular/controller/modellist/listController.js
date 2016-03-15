var app = angular.module('myapp');

app.controller('listController', function($scope, $state, ModelAPI, $rootScope, $uibModal) {

	$scope.animationsEnabled = true;

	ModelAPI.getAllModels($rootScope.loggeduser).then(function(models) {
		$scope.models = models.data;
	});

	$scope.openModel = function(model) {
		$state.go('conceptual', {
			'modelid': model._id
		});
	}

	$scope.newModel = function() {
		//TODO refac it to a controller
		var modalInstance = $uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'angular/view/modal/newModelModal.html',
			controller:  'newModelModalController'
		});

		modalInstance.result.then(function (model) {
			ModelAPI.saveModel(model).then(function(newModel){
				$scope.openModel(newModel);
			});
		});
	};

	$scope.toggleAnimation = function() {
		$scope.animationsEnabled = !$scope.animationsEnabled;
	};

	$scope.deleteModel = function(model) {
		ModelAPI.deleteModel(model._id).then(function (resp) {
			if (resp.status === 200){
				console.log($scope.models.indexOf(model));
				$scope.models.splice($scope.models.indexOf(model), 1);
			}
		});
	}

});
