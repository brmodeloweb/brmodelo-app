var app = angular.module('myapp');

app.controller('ModelModalController', function($scope, $uibModalInstance, $rootScope){

	$scope.submitted = false;
	var self = this;

	$scope.save = function(modelname) {
		$scope.submitted = true;
		if(modelname != null && modelname != ""){
			newmodel = {};
			newmodel.name = modelname;
			newmodel.user = $rootScope.loggeduser;
			newmodel.type = self.getType();
			newmodel.model = '{"cells":[]}';
			$uibModalInstance.close(newmodel);
		}
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

});