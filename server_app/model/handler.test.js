const request = require("supertest");
const app = require("../app");

jest.mock("./service");
const mockModelService = require("./service");
const { encrypt } = require("../helpers/crypto");

afterEach(() => {
	jest.restoreAllMocks();
});

describe("Test save /models", () => {
	test("It should send 422 when validation fails", async () => {
		const response = await request(app)
			.post("/models")
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
	test("It should send 200 user exists", async () => {
		const response = await request(app).get("/").send([]);
		expect(response.statusCode).toBe(200);
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
		process.env.SECRET_TOKEN = "some_token";
		mockModelService.exportModel.mockReturnValue({
			name: "modeloteste",
			data: encrypt(JSON.stringify(model)),
		});

		const response = await request(app)
			.get("/models/6179eacfc9cac3976aef0fec/export")
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
		process.env.SECRET_TOKEN = "some_token";
		mockModelService.exportModel.mockImplementation(() => {
			throw new Error();
		});

		const response = await request(app)
			.get("/models/6179eacfc9cac3976aef0fec/export")
			.send(encrypt(JSON.stringify(model)));

		expect(response.statusCode).toBe(500);
		expect(mockModelService.exportModel).toHaveBeenCalled();
	});
});
