var app = angular.module('myapp');

app.controller('AttributeModalController', function($scope, $uibModalInstance, params){

	$scope.params = params;
	$scope.qt = 2;
	$scope.userOption = "add_attributes";

	$scope.go = function(new_table) {
		if($scope.userOption=="new_table"){
			$uibModalInstance.close($scope.userOption);
		} else {
			$uibModalInstance.close($scope.qt);
		}
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

});
