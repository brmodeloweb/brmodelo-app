var app = angular.module('myapp');

app.controller('newModelModalController', function($scope, $state, $uibModalInstance, $rootScope){

	$scope.selectedType = {};
	$scope.types = [{txt: 'Conceitual', type: 'conceptual'},
									// {txt: 'Lógico'   , type: 'Logic'}
								 ];

	$scope.save = function(newmodel) {
		newmodel.user = $rootScope.loggeduser;
		newmodel.type = 'conceptual';
		newmodel.model = '{"cells":[]}';
		$uibModalInstance.close(newmodel);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

});