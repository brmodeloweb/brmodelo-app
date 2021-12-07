const modelRepository = require("./model");
const { encrypt } = require("../helpers/crypto");

const listAll = async (userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			const models = await modelRepository.find({ who: userId });
			if (models != null) {
				resolve(models);
			}
			return resolve([]);
		} catch (error) {
			console.error(error);
			reject(error);
		}
	});
};

const getById = async (modelId) => {
	return new Promise(async (resolve, reject) => {
		try {
			const model = await modelRepository.findOne({ _id: modelId });
			return resolve(model);
		} catch (error) {
			console.error(error);
			reject(error);
		}
	});
};

const save = async ({ name, type, model, userId }) => {
	return new Promise(async (resolve, reject) => {
		try {
			const createdModel = await modelRepository.create({
				who: userId,
				type: type,
				model: model,
				name: name,
				updated: Date.now()
			});
			return resolve(createdModel);
		} catch (error) {
			console.error(error);
			reject(error);
		}
	});
};

const edit = async (modelId, model) => {
	return new Promise(async (resolve, reject) => {
		try {
			const response = await modelRepository.findOneAndUpdate(
				{ _id: modelId },
				{ $set: { model: model, updated: Date.now() } }
			);
			if (response != null) {
				return resolve(response);
			}
			return reject();
		} catch (error) {
			console.error(error);
			reject(error);
		}
	});
};

const rename = async (modelId, newName) => {
	return new Promise(async (resolve, reject) => {
		try {
			const response = await modelRepository.findOneAndUpdate(
				{ _id: modelId },
				{ $set: { name: newName, updated: Date.now() } }
			);
			if (response != null) {
				return resolve(response);
			}
			return reject();
		} catch (error) {
			console.error(error);
			reject(error);
		}
	});
};

const remove = async (modelId) => {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await modelRepository.deleteOne({ _id: modelId });
			if(result.ok) {
				return resolve("ok");
			}
			return reject();
		} catch (error) {
			console.error(error);
			reject(error);
		}
	});
};

const exportModel = async (modelId) => {
	return new Promise(async (resolve, reject) => {
		try {
			const model = await getById(modelId);
			return resolve({
				name: model.name.replace(/[^a-zA-Z0-9]/g, ""),
				data: encrypt(JSON.stringify(model)),
			});
		} catch (error) {
			console.error(error);
			return reject(error);
		}
	});
};

const modelService = {
	listAll,
	getById,
	save,
	edit,
	remove,
	rename,
	exportModel,
};

module.exports = modelService;
