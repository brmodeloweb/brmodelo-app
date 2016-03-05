angular.module('myapp').controller('listController', function($scope, $state, ModelAPI, $rootScope) {

	ModelAPI.getAllModels($rootScope.loggeduser).then(function(models) {
		$scope.models = models.data;
	});

	$scope.openModel = function(model) {
		$state.go('conceptual', {
			'modelid': model._id
		});
	}

	$scope.newModel = function() {
		$state.go('conceptual', {
			'modelid': 0
		});
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
