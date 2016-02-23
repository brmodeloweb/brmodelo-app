angular.module('myapp').controller('listController', function($scope, $state, ModelAPI, $rootScope) {

	ModelAPI.getAllModels($rootScope.loggeduser).then(function(models) {
		$scope.models = models.data;
	});

	$scope.openModel = function(model) {
		$state.go('conceptual', {
			'modelid': model._id
		});
	}

});