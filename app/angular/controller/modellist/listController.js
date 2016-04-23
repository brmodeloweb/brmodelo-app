var app = angular.module('myapp');

app.controller('listController', function($scope, $state, ModelAPI, $rootScope, $uibModal) {

	var vm = this;
	vm.models = [];

	ModelAPI.getAllModels($rootScope.loggeduser).then(function(models) {
		vm.models = models.data;
	});

	vm.openModel = function(model) {
		$state.go(model.type, {
			'modelid': model._id
		});
	};

	vm.newModel = function() {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'angular/view/modal/newModelModal.html',
			controller:  'ModelModalController'
		});

		modalInstance.result.then(function (model) {
			ModelAPI.saveModel(model).then(function(newModel){
				vm.openModel(newModel);
			});
		});
	};

	vm.deleteModel = function(model) {
		ModelAPI.deleteModel(model._id).then(function (resp) {
			if (resp.status === 200){
				vm.models.splice(vm.models.indexOf(model), 1);
			}
		});
	};

});
