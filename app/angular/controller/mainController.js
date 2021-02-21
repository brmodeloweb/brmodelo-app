var app = angular.module('myapp');

app.controller('mainController', function($scope) {
	$scope.loading = false;
	$scope.showLoading = function(load) {
		$scope.loading = load;
	}
});