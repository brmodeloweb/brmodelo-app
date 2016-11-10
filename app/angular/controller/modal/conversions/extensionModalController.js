var app = angular.module('myapp');

app.controller('ExtensionModalController', function($scope, $uibModalInstance, params){

	$scope.params = params;
	$scope.userOption = "all_tables";

	$scope.go = function(new_table) {
		$uibModalInstance.close($scope.userOption);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

});
