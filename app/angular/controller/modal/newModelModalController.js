var app = angular.module('app.modelModalController', []);

app.controller('ModelModalController', function($scope, $uibModalInstance, $rootScope){

	$scope.selected = 'Conceitual';
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

	self.getType = function(){
		if($scope.selected == 'Conceitual'){
			return 'conceptual';
		}
		return 'logic';
	}

});

export default app.name;