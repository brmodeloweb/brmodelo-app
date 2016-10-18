var app = angular.module('myapp');

app.controller('AttributeModalController', function($scope, $uibModalInstance, $rootScope){

	$scope.go = function(modelname) {
		$uibModalInstance.close(modelname);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

});
