angular.module('myapp').controller('listController', function($scope, ModelAPI){

	ModelAPI.getAllModels().then(function(models){

		console.log(models.data);

		$scope.models = models.data;
	});
});