var app = angular.module('myapp');

app.controller('ExtensionModalController', function($scope, $uibModalInstance, params){

	$scope.params = params;
	$scope.userOption = "one_table";

	$scope.go = function(new_table) {
		$uibModalInstance.close($scope.userOption);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

});
