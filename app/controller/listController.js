angular.module('myapp').controller('listController', function($scope, ModelAPI){
	$scope.models = [{'name': 'h1'}, {'name': 'h3'}, {'name': 'h2'}];

	ModelAPI.getAllModels().then(function(models){
		$scope.models = models.data;
	});
});