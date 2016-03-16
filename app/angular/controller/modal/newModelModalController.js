var app = angular.module('myapp');

app.controller('newModelModalController', function($scope, $state, $uibModalInstance, $rootScope){

	$scope.types = [{id: 1, txt: 'Conceitual', type: 'conceptual'}];
							//  {txt: 'Lógico'   , type: 'Logic'}

	$scope.selected = $scope.types[0];

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