const modelRepository = require("./model");

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
			const model = await modelRepository.find({ _id: modelId });
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
			const createdModel = await UserRepository.create({
				who: userId,
				type: type,
				model: model,
				name: name,
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
			const currentModel = getById({ modelId });

			currentModel.body = model;

			modelRepository.save(currentModel);

			return resolve(currentModel);
		} catch (error) {
			console.error(error);
			reject(error);
		}
	});
};

const rename = async (modelId, newName) => {
	return new Promise(async (resolve, reject) => {
		try {
			const currentModel = getById({ modelId });

			currentModel.name = newName;

			modelRepository.save(currentModel);

			return resolve(currentModel);
		} catch (error) {
			console.error(error);
			reject(error);
		}
	});
};

const remove = async (modelId) => {
	return new Promise(async (resolve, reject) => {
		try {
			const model = modelRepository.findOne({ _id: modelId });

			modelRepository.remove(model);

			return resolve("ok");
		} catch (error) {
			console.error(error);
			reject(error);
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
};

module.exports = modelService;
