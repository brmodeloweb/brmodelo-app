var app = angular.module('myapp');

app.controller('listController', function($scope, $state, ModelAPI, $rootScope, $uibModal, AuthService) {

	var self = this;
	self.models = [];

	$scope.initList = function() {
		$scope.showLoading(true);
		ModelAPI.getAllModels($rootScope.loggeduser).then(function(models) {
			self.models = models.data;
			$scope.showLoading(false);
		});
	}

	self.openModel = function(model) {
		$state.go(model.type, {
			'modelid': model._id
		});
	};

	self.newModel = function() {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'angular/view/modal/newModelModal.html',
			controller:  'ModelModalController'
		});

		modalInstance.result.then(function (model) {
			ModelAPI.saveModel(model).then(function(newModel){
				self.openModel(newModel);
			});
		});
	};

	self.deleteModel = function(model) {
		ModelAPI.deleteModel(model._id).then(function (resp) {
			if (resp.status === 200){
				self.models.splice(self.models.indexOf(model), 1);
			}
		});
	};

	self.getTypeName = function(type) {
		if(type == 'conceptual'){
			return "Conceitual";
		}
		return "Lógico";
	}

	self.getAuthorName = function(type) {
		return AuthService.loggeduserName;
	}

});
