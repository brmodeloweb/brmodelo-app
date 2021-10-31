var app = angular.module('myapp');

app.controller('mainController', function($scope, $state, AuthService) {
	$scope.loading = false;
	$scope.showLoading = function(load) {
		$scope.loading = load;
	}
});