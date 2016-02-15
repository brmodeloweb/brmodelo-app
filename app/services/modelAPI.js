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

	return {
		saveModel : _saveModel,
		getAllModels : _getAllModels
	}

});