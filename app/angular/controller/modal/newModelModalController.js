var app = angular.module('myapp');

app.controller('newModelModalController', function($scope, $state, $uibModalInstance, $rootScope){

	$scope.selectedType = {};
	$scope.types = ['Conceitual', 'Lógico'];

	$scope.ok = function(newmodel) {
		newmodel.user = $rootScope.loggeduser;
		$uibModalInstance.close(newmodel);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

});