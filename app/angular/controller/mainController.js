var app = angular.module('myapp');

app.controller('mainController', function($scope, $state, AuthService) {

	$scope.newModel = function() {
		$state.go('conceptual', {
			'modelid': 0
		});
	};

});
