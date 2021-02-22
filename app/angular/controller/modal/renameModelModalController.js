const controller = ($scope, $uibModalInstance) => {
	$scope.submitted = false;

	$scope.rename = (newName) => {
		$scope.submitted = true;
		if (newName != null && newName != "") {
			$uibModalInstance.close(newName);
		}
	};

	$scope.cancel = () => {
		$uibModalInstance.dismiss("cancel");
	};
};

export default angular
	.module("app.renameModelModalController", [])
	.controller("RenameModelModalController", controller).name;
