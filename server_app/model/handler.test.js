const request = require("supertest");
const app = require("../app");

jest.mock("./service");
jest.mock('jsonwebtoken');
process.env.SECRET_TOKEN = 'mockSecretToken';


const mockModelService = require("./service");
const { encrypt } = require("../helpers/crypto");

jest.mock('../helpers/config', () => ({
	SecretToken: 'mockSecretToken',
}));
jest.mock('jsonwebtoken', () => ({
	...jest.requireActual('jsonwebtoken'), // import and keep all other methods unchanged
	sign: jest.fn(() => 'mockedToken'),
	verify: jest.fn((token, secret, cb) => {
		cb(null, { id: 'global-user-id' });
	}),
}));


afterEach(() => {
	jest.clearAllMocks();
});


describe("Test save /models", () => {
	test("It should send 422 when validation fails", async () => {
		const response = await request(app)
			.post("/models")
			.set("brx-access-token", 'mockToken')
			.send({
				name: "Teste",
				type: "conceptual",
				model: { id: "1234" },
			});
		expect(response.statusCode).toBe(422);
	});

	test("It should send 200 when user model is saved", async () => {
		const response = await request(app)
			.post("/models")
			.set("brx-access-token", 'mockToken')
			.send({
				name: "Teste",
				type: "conceptual",
				model: { id: "1234" },
				user: "12345",
			});
		mockModelService.save.mockResolvedValue({
			name: "Teste",
			type: "conceptual",
			model: { id: "1234" },
			user: "12345",
		});
		expect(response.statusCode).toBe(200);
		expect(mockModelService.save).toHaveBeenCalled();
	});
});

describe("Test list all /models", () => {

	beforeEach(() => {
		jest.resetModules();
	});

	test("It should send 200 user exists", async () => {
		const response = await request(app)
			.get("/models")
			.set("brx-access-token", 'mockToken')
			.send([]);
		mockModelService.listAll.mockResolvedValue([]);

		expect(response.statusCode).toBe(200);
		expect(mockModelService.listAll).toHaveBeenCalled();
	});
});

describe("Test export /models", () => {
	const OLD_ENV = process.env;

	beforeEach(() => {
		jest.resetModules();
		process.env = { ...OLD_ENV };
	});

	afterAll(() => {
		process.env = OLD_ENV;
	});

	process.env.SECRET_TOKEN = "talkischeapshowmethecode";

	const model = {
		_id: "6179eacfc9cac3976aef0fec",
		who: "6179eac1c9cac3976aef0fe8",
		type: "conceptual",
		model:
			'{"cells":[{"type":"erd.Entity","supertype":"Entity","isExtended":false,"autorelationship":false,"size":{"width":80,"height":40},"position":{"x":280,"y":120},"angle":0,"id":"9a6cc538-d1bd-4e39-8c38-a85078814dc9","z":1,"attrs":{".outer":{"fill":"#FFFFFF","stroke":"black"},"text":{"text":"Entidade"}}},{"type":"erd.Relationship","supertype":"Relationship","autorelationship":false,"size":{"width":85,"height":45},"position":{"x":560,"y":120},"angle":0,"id":"f5a1e4c3-a6a2-49f1-9e92-7b7210695d5a","z":2,"attrs":{".outer":{"fill":"#FFFFFF","stroke":"black"},"text":{"text":"Rel"}}},{"type":"erd.BlockAssociative","supertype":"Entity","size":{"width":100,"height":50},"position":{"x":780,"y":120},"angle":0,"id":"18f3b6fc-83de-4ad0-9dc4-e07569598374","z":3,"embeds":["1d11c65e-89d4-47f2-b991-dd0068833d77"],"attrs":{".outer":{"fill":"transparent","stroke":"black"}}},{"type":"erd.Relationship","supertype":"Relationship","autorelationship":false,"size":{"width":85,"height":45},"position":{"x":786,"y":122},"angle":0,"id":"1d11c65e-89d4-47f2-b991-dd0068833d77","z":4,"parent":"18f3b6fc-83de-4ad0-9dc4-e07569598374","attrs":{".outer":{"fill":"#FFFFFF","stroke":"black"},"text":{"text":"Rel"}}},{"type":"link","source":{"id":"f5a1e4c3-a6a2-49f1-9e92-7b7210695d5a"},"target":{"id":"18f3b6fc-83de-4ad0-9dc4-e07569598374"},"id":"b99e4aef-2826-4df3-b4fd-17bcb81f5fa5","z":5,"labels":[{"position":0.7,"attrs":{"text":{"text":"(0, n)"}}}],"attrs":{}},{"type":"link","source":{"id":"f5a1e4c3-a6a2-49f1-9e92-7b7210695d5a"},"target":{"id":"9a6cc538-d1bd-4e39-8c38-a85078814dc9"},"id":"7c54152c-b6f1-4423-9543-3c57c6087036","z":6,"labels":[{"position":0.7,"attrs":{"text":{"text":"(0, n)"}}}],"attrs":{}}]}',
		name: "modeloteste",
		created: "2021-10-28T00:11:59.121Z",
		__v: 0,
	};

	test("It should send 200 when model is exported", async () => {
		mockModelService.exportModel.mockReturnValue({
			name: "modeloteste",
			data: encrypt(JSON.stringify(model)),
		});

		const response = await request(app)
			.get("/models/6179eacfc9cac3976aef0fec/export")
			.set("brx-access-token", 'mockToken')
			.send(encrypt(JSON.stringify(model)));

		expect(response.header).toHaveProperty("content-type");
		expect(response.header).toHaveProperty("content-disposition");
		expect(response.header).toHaveProperty("content-length");
		expect(response.header["content-type"]).toEqual("application/octet-stream");
		expect(response.header["content-disposition"]).toEqual(
			"attachment; filename=modeloteste.brm"
		);
		expect(response.header["content-length"]).toEqual("2137");
		expect(response.statusCode).toBe(200);
		expect(mockModelService.exportModel).toHaveBeenCalled();
	});

	test("It should send 500 when model is not exported", async () => {
		mockModelService.exportModel.mockImplementation(() => {
			throw new Error();
		});

		const response = await request(app)
			.get("/models/6179eacfc9cac3976aef0fec/export")
			.set("brx-access-token", 'mockToken')
			.send(encrypt(JSON.stringify(model)));

		expect(response.statusCode).toBe(500);
		expect(mockModelService.exportModel).toHaveBeenCalled();
	});
});

describe("Test import /models", () => {
	const OLD_ENV = process.env;
	beforeEach(() => {
		jest.resetModules();
		process.env = { ...OLD_ENV };

	});
	afterAll(() => {
		process.env = OLD_ENV;

	});

	process.env.SECRET_TOKEN = "talkischeapshowmethecode";

	test("It should return 400 when no file is uploaded", async () => {
		const response = await request(app)
			.post("/models/import")
			.set("brx-access-token", 'mockToken')
			.set("x-user-id", "6179eac1c9cac3976aef0fe8")
			.attach("model", null, "test01.brm");
		expect(response.statusCode).toBe(400);
		expect(mockModelService.save).not.toHaveBeenCalled();
	});

	test("It should return 422 when file is uploaded with any model validation error", async () => {
		const jsonObject = {
			name: "someName",
			type: "someType",
			model: {},
			userId: "someUserId"
		};
		const jsonString = JSON.stringify(jsonObject);
		const encryptedString = encrypt(jsonString);
		const buffer = Buffer.from(encryptedString, 'utf-8');

		const response = await request(app)
			.post("/models/import")
			.attach("model", buffer, "test01.brm")
			.set("brx-access-token", 'mockToken');

		expect(response.statusCode).toBe(422);
		expect(mockModelService.save).not.toHaveBeenCalled();
	});

	test("It should return 200 when file is uploaded with valid model", async () => {
		const importedModel = {
			_id: "61bc97de61d9cc2ed630a3c5",
			who: "6179eac1c9cac3976aef0fe8",
			type: "conceptual",
			model:
				'{"cells":[{"type":"erd.Entity","supertype":"Entity","isExtended":false,"autorelationship":false,"size":{"width":80,"height":40},"position":{"x":350,"y":130},"angle":0,"id":"00ce31c4-7668-496b-9368-2fdd56bdef7b","z":2,"attrs":{}},{"type":"erd.Entity","supertype":"Entity","isExtended":false,"autorelationship":false,"size":{"width":80,"height":40},"position":{"x":160,"y":340},"angle":0,"id":"7d16da9e-5645-4b98-b0aa-bc6c1e9297cd","z":3,"attrs":{}},{"type":"erd.Relationship","supertype":"Relationship","autorelationship":false,"size":{"width":85,"height":45},"position":{"x":255,"y":235},"angle":0,"id":"401fb774-6124-4f07-abaf-2d2921f362d8","z":5,"attrs":{}},{"type":"erd.Link","supertype":"Link","weak":false,"role":"","source":{"id":"00ce31c4-7668-496b-9368-2fdd56bdef7b"},"target":{"id":"401fb774-6124-4f07-abaf-2d2921f362d8"},"id":"c232f0ae-e743-44be-ad39-eab83c12f363","z":6,"labels":[{"position":0.3,"attrs":{"text":{"text":"(0, n)"}}}],"attrs":{}},{"type":"erd.Link","supertype":"Link","weak":false,"role":"","source":{"id":"7d16da9e-5645-4b98-b0aa-bc6c1e9297cd"},"target":{"id":"401fb774-6124-4f07-abaf-2d2921f362d8"},"id":"fd1ab2c9-cef5-4eee-8879-a1e75fac7cc8","z":7,"labels":[{"position":0.3,"attrs":{"text":{"text":"(0, n)"}}}],"attrs":{}}]}',
			name: "teste",
			updated: "2021-12-17T13:59:58.915Z",
			created: "2021-12-17T13:59:58.918Z",
			__v: 0,
		};
		mockModelService.save.mockReturnValue(importedModel);
		const jsonString = JSON.stringify(importedModel);
		const encryptedString = encrypt(jsonString);
		const buffer = Buffer.from(encryptedString, 'utf-8');

		const response = await request(app)
			.post("/models/import")
			.set("brx-access-token", 'mockToken')
			.set("x-user-id", "6179eac1c9cac3976aef0fe8")
			.attach("model", buffer, "test01.brm");

		expect(response.statusCode).toBe(200);
		expect(response.body).toEqual(importedModel);
		expect(mockModelService.save).toHaveBeenCalled();
	});

	test("It should return 500 when model is not imported", async () => {

		const jsonObject = {
			name: "someName",
			type: "someType",
			model: {},
			userId: "someUserId"
		};
		const jsonString = JSON.stringify(jsonObject);
		const encryptedString = encrypt(jsonString);
		const buffer = Buffer.from(encryptedString, 'utf-8');
		mockModelService.save.mockImplementation(() => {
			throw new Error();
		});

		const response = await request(app)
			.post("/models/import")
			.set("brx-access-token", 'mockToken')
			.set("x-user-id", "6179eac1c9cac3976aef0fe8")
			.attach("model", buffer, "test01.brm");

		expect(response.statusCode).toBe(500);
		expect(mockModelService.save).toHaveBeenCalled();
	});
});
