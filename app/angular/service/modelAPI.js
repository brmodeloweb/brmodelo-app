angular.module('myapp').factory('ModelAPI', function($http){

	_saveModel = function(model){
		return $http
			.post('/models', model)
			.then(function(newModel){
				return newModel.data;
			});
	}

	_getAllModels = function(_userId){
		return $http
			.get('/models', {
				params: {'userId': _userId}
			}).then(function(res){
				return res;
			});
	}

	_updateModel = function(model){
		return $http
			.put('/models/:modelId', model).then(function(res){
				console.log(res);
			});
	}

	_getModel = function(_modelId, _userId){
		return $http
			.get('/models/:modelId', {
    		params: {'userId': _userId, 'modelId': _modelId}
			}).then(function(resp){
				return resp;
			});
	}

	_deleteModel = function(_modelId){
		return $http.delete('/models/:modelId', {
			params: {'modelId': _modelId}
		}).then(function(resp){
			return resp;
		});
	}

	return {
		saveModel : _saveModel,
		getAllModels : _getAllModels,
		getModel : _getModel,
		updateModel : _updateModel,
		deleteModel : _deleteModel
	}

});
