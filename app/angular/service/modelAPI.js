import angular from "angular";

const BASE_URL = "http://localhost:3000"

const authService = ($http) => {
	const _saveModel = function (model) {
		return $http.post(`${BASE_URL}/models`, model).then(function (newModel) {
			return newModel.data;
		});
	};

	const _getAllModels = function (_userId) {
		return $http
			.get(`${BASE_URL}/models`, {
				params: { userId: _userId },
			})
			.then(function (res) {
				return res;
			});
	};

	const _updateModel = function (model) {
		return $http.put(`${BASE_URL}/models/${model.id}`, model).then(function (res) {
			console.log(res);
		});
	};

	const _getModel = function (_modelId, _userId) {
		return $http
			.get(`${BASE_URL}/models/:modelId`, {
				params: { userId: _userId, modelId: _modelId },
			})
			.then(function (resp) {
				return resp;
			});
	};

	const _deleteModel = function (_modelId) {
		return $http
			.delete(`${BASE_URL}/models/:modelId`, {
				params: { modelId: _modelId },
			})
			.then(function (resp) {
				return resp;
			});
	};

	const _renameModel = function (_modelId, newName) {
		return $http
			.put(`${BASE_URL}/models/${_modelId}/rename`, { name: newName })
			.then(function (resp) {
				return resp;
			});
	};

	return {
		saveModel: _saveModel,
		getAllModels: _getAllModels,
		getModel: _getModel,
		updateModel: _updateModel,
		deleteModel: _deleteModel,
		renameModel: _renameModel,
	};
};

export default angular
	.module("app.modelAPI", [])
	.factory("ModelAPI", authService).name;
