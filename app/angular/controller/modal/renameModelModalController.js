const controller = ($scope, $uibModalInstance) => {
	$scope.submitted = false;

	$scope.rename = (newName) => {
		$scope.submitted = true;
		if(newName != null && newName != ""){
			$uibModalInstance.close(newName);
		}
	}

	$scope.cancel = () => {
		console.log("cancel!");
		$uibModalInstance.dismiss('cancel');
	};
}

angular.module('myapp').controller('RenameModelModalController', controller);