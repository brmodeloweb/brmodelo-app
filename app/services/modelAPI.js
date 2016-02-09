angular.module('myapp').factory('ModelAPI', function($http){

	_saveModel = function(model){
		return $http
			.post('/saveModel', model)
			.then(function(res){
				console.log(res);
			});
	}

	return {
		saveModel : _saveModel
	}

});