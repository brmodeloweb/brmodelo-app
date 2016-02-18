angular.module('myapp').factory('ModelAPI', function($http){

	_saveModel = function(model){
		return $http
			.post('/saveModel', model)
			.then(function(res){
				console.log(res);
			});
	}

	_getAllModels = function(){
		return $http
			.get('/getAllModels')
			.then(function(res){
			//	console.log(res);
				return res;
			});
	}

	_getModel = function(_modelId, _userId){

		return $http
			.get('/getModel', {
    		params: {'userId': _userId, 'modelId': _modelId}
			}).then(function(resp){
				return resp;
			});
	}

	return {
		saveModel : _saveModel,
		getAllModels : _getAllModels,
		getModel : _getModel
	}

});
