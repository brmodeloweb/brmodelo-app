const controller = ($scope, $uibModalInstance) => {
	this.submitted = false;

	this.save = (newName) => {
		$scope.submitted = true;
		if(newName != null && newName != ""){
			$uibModalInstance.close(newName);
		}
	}

	this.cancel = () => {
		$uibModalInstance.dismiss('cancel');
	};

}

angular.module('myapp').controller('RenameModelModalController', controller);