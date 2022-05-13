const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const modelService = require("./service");
const modelValidator = require("./validator");
const { decrypt } = require("../helpers/crypto");

const router = express.Router();
router.use(bodyParser.json());
router.use(fileUpload());

const listAll = async (req, res) => {
	try {
		const userId = req.query.userId;
		const models = await modelService.listAll(userId);
		return res
			.status(200)
			.send(models);
	} catch (error) {
		console.error("caiu na rede");
		console.error(error);
		return res.status(500).send("There's an error listing your models");
	}
};

const getById = async (req, res) => {
	try {
		let modelId = req.query.modelId;
		const model = await modelService.getById(modelId);
		res.send(model);
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.send("There's an error while treating your get request");
	}
};

const save = async (req, res) => {
	try {
		const name = req.body.name;
		const type = req.body.type;
		const userId = req.body.user;
		const model = req.body.model;

		const validation = modelValidator.validateSaveParams({
			name,
			type,
			model,
			userId,
		});

		if (!validation.valid) {
			return res.status(422).send(validation.message);
		}

		const newModel = await modelService.save({ name, type, model, userId });

		res.send(newModel);
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.send("There's an error while treating your save model request");
	}
};

const edit = async (req, res) => {
	try {
		const modelId = req.params.modelId;
		const newModel = req.body.model;
		const editedModel = await modelService.edit(modelId, newModel);
		res.send(editedModel);
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.send("There's an error while treating your edit model request");
	}
};

const remove = async (req, res) => {
	try {
		const modelId = req.query.modelId;
		const responde = await modelService.remove(modelId);
		res.sendStatus(200);
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.send("There's an error while treating your remove model request");
	}
};

const rename = async (req, res) => {
	try {
		const modelId = req.params.modelId;
		const newName = req.body.name;
		const editedModel = await modelService.rename(modelId, newName);
		res.status(200).send(editedModel);
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.send("There's an error while treating your rename model request");
	}
};

const exportModel = async (req, res) => {
	try {
		const { modelId } = req.params;
		const { name, data } = await modelService.exportModel(modelId);
		res.writeHead(200, {
			"Content-Type": "application/octet-stream",
			"Content-Disposition": `attachment; filename=${name}.brm`,
			"Content-Length": data.length,
		});
		return res.end(data);
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.send("There's an error while treating export your model request");
	}
};

const importModel = async (req, res) => {
	try {
		if (!req.files) {
			return res.status(400).send("No file uploaded");
		}
		const file = req.files.model;
		const { name, type, model } = JSON.parse(decrypt(file.data));
		const userId = req.headers["x-user-id"]; // TODO Change this when implementing authentication via jwt
		const validation = modelValidator.validateSaveParams({
			name,
			type,
			model,
			userId,
		});
		if (!validation.valid) {
			return res.status(422).send(validation.message);
		}
		const newModel = await modelService.save({ name, type, model, userId });
		return res.status(200).json(newModel);
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.send("There's an error while treating import your model request");
	}
};

module.exports = router
	.get("/", listAll)
	.post("/", save)
	.get("/:modelId", getById)
	.put("/:modelId", edit)
	.delete("/:modelId", remove)
	.put("/:modelId/rename", rename)
	.get("/:modelId/export", exportModel)
	.post("/import", importModel);
