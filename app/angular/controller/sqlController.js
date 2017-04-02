var sqlController = function(AuthService, $state, $scope, $stateParams) {
	var self = this;
	$scope.sql = $stateParams.code;
};

angular.module('myapp').controller('sqlController', sqlController);
