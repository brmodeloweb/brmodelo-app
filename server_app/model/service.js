const modelRepository = require("./model");

const getSharedLink = (id) => {
	const baseurl = process.env.PROD_MAIL_ENV || 'http://localhost:9000';
	return `${baseurl}/#!/publicview/${id}`
}

const listAll = async (userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			const models = await modelRepository.find({ who: userId }, { model: 0 });
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

const getById = async (modelId, userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			const model = await modelRepository.findOne({ _id: modelId });
			if(model == null) {
				const notFoundErr =  new Error('model not found');
				notFoundErr.status = 404;
				throw notFoundErr;
			}
			if(model != null && model.who != userId) {
				const notAuthotizedErr =  new Error('user not authorired');
				notAuthotizedErr.status = 401;
				throw notAuthotizedErr;
			}
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
			if(result != null) {
				return resolve("ok");
			}
			return reject();
		} catch (error) {
			console.error(error);
			reject(error);
		}
	});
};

const buildConfigResponse = (shareOptions) => {
	return {
		"active": shareOptions.active,
		"url": getSharedLink(shareOptions._id)
	}
}

const toggleShare = async (modelId, active) => {
	return new Promise(async (resolve, reject) => {
		try {
			const model = await modelRepository.findOne({ _id: modelId });
			if(model != null) {
				const shareOptions = model.shareOptions != null ? model.shareOptions : {"active": active}
				shareOptions.active = active;
				const updatedModel = await modelRepository.findOneAndUpdate(
					{ _id: modelId },
					{ $set: { shareOptions: shareOptions, updated: Date.now() } },
					{ new: true }
				);
				if(updatedModel != null) {
					return resolve(buildConfigResponse(updatedModel.shareOptions));
				}
				return reject();
			}
		} catch (error) {
			console.error(error);
			return reject(error);
		}
	});
};

const findShareOptions = async (modelId) => {
	return new Promise(async (resolve, reject) => {
		try {
			const model = await modelRepository.findOne({ _id: modelId });
			if(model != null && model.shareOptions != null) {
				return resolve(buildConfigResponse(model.shareOptions));
			}
			const shareOptions = {"active": false};
			const updatedModel = await modelRepository.findOneAndUpdate(
				{ _id: modelId },
				{ $set: { shareOptions: shareOptions, updated: Date.now() } },
				{ new: true }
			);
			return resolve(buildConfigResponse(updatedModel.shareOptions));
		} catch (error) {
			console.error(error);
			return reject(error);
		}
	});
};

const countAll = async (userId) => {
	return new Promise(async (resolve, reject) => {
		try {
			const count = await modelRepository.count({ who: userId });
			return resolve(count);
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
	toggleShare,
	countAll,
	findShareOptions
};

module.exports = modelService;
