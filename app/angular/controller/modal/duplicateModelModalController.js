const app = angular.module("app.duplicateModelModalController", []);

app.controller(
	"DuplicateModelModalController",
	function ($scope, $uibModalInstance, params) {
		$scope.submitted = false;
		$scope.name = params.suggestedName;

		$scope.save = function (modelname) {
			$scope.submitted = true;
			if (modelname != null && modelname != "") {
				$uibModalInstance.close(modelname);
			}
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss("cancel");
		};
	}
);

export default app.name;
