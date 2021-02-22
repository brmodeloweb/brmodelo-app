var app = angular.module("app.modelModalController", []);

app.controller(
	"ModelModalController",
	function ($scope, $uibModalInstance, $rootScope) {
		$scope.typeSelected = { name: "Conceitual", type: "conceptual" };
		$scope.submitted = false;

		$scope.doSelectType = function(newSelectedType) {
			$scope.typeSelected = newSelectedType;
		}

		$scope.save = function (modelname) {
			$scope.submitted = true;
			if (modelname != null && modelname != "") {
				const newmodel = {};
				newmodel.name = modelname;
				newmodel.user = $rootScope.loggeduser;
				newmodel.type = $scope.typeSelected.type;
				newmodel.model = '{"cells":[]}';
				$uibModalInstance.close(newmodel);
			}
		};

		$scope.cancel = function () {
			$uibModalInstance.dismiss("cancel");
		};
	}
);

export default app.name;
