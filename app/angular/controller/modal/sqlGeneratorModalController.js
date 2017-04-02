var app = angular.module('myapp');

app.controller('SqlGeneratorModalController', function($scope, $uibModalInstance, params){

  $scope.sql = params.sql;

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

});
