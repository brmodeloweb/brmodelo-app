var app = angular.module('myapp');

app.controller('DeleteModalController', function($scope, $uibModalInstance, $rootScope){

	var self = this;

	$scope.save = function(doDelete) {
		$uibModalInstance.close(doDelete);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

});
