var app = angular.module('myapp');

app.controller('ModelModalController', function($scope, $uibModalInstance, $rootScope){

	$scope.selected = 'conceptual';

	$scope.save = function(validForm, newmodel) {
		console.log(validForm);
		if(validForm){
			newmodel.user = $rootScope.loggeduser;
			newmodel.type = $scope.selected;
			newmodel.model = '{"cells":[]}';
			$uibModalInstance.close(newmodel);
		}
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

});