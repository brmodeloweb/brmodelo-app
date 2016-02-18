angular.module('myapp').controller('listController', function($scope, $state, ModelAPI) {

	ModelAPI.getAllModels().then(function(models) {
		$scope.models = models.data;
	});

	$scope.openModel = function(model) {
		$state.go('workspace.conceptual', {
			'modelid': model._id
		});
	}

});