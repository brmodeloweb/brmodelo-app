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
		if(model.type === "logic") {
			return $state.go("logic", {"references": {'modelid': model._id, 'conversionId': ""}});	
		}
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
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'angular/view/modal/deleteModelModal.html',
			controller:  'DeleteModalController'
		});

		modalInstance.result.then(function() {
			self.doDelete(model);
		});
	};

	self.renameModel = function(model) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'angular/view/modal/renameModelModal.html',
			controller:  'RenameModelModalController'
		});

		modalInstance.result.then(function(newName) {
			ModelAPI.renameModel(model._id, newName).then(function (resp) {
				if (resp.status === 200){
					model.name = newName;
				}
				$scope.showLoading(false);
			});
		});
	};

	self.doDelete = function(model) {
		$scope.showLoading(true);
		ModelAPI.deleteModel(model._id).then(function (resp) {
			if (resp.status === 200){
				self.models.splice(self.models.indexOf(model), 1);
			}
			$scope.showLoading(false);
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

	self.duplicateModel = function(model) {
		let modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'angular/view/modal/duplicateModelModal.html',
			controller:  'DuplicateModelModalController',
			resolve: {
				params: function () {
					return {'suggestedName': `${model.name} (cópia)`};
				}
			}
		});
		modalInstance.result.then(function (newName) {
			$scope.showLoading(true);
			const duplicatedModel = {
				"id": '',
				"name": newName,
				"type": model.type,
				"model": model.model,
				"user": model.who
			}
			ModelAPI.saveModel(duplicatedModel).then(function(newModel){
				self.models.push(newModel);
				$scope.showLoading(false);
			});
		});
	}

});
