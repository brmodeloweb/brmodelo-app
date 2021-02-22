var app = angular.module("app.deleteModalController", []);

app.controller("DeleteModalController", function ($scope, $uibModalInstance) {
	$scope.save = function (doDelete) {
		$uibModalInstance.close(doDelete);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss("cancel");
	};
});

export default app.name;
