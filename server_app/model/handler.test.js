const request = require("supertest");
const app = require("../app");

jest.mock("./service");
jest.mock('jsonwebtoken');
process.env.SECRET_TOKEN = 'mockSecretToken';

const mockModelService = require("./service");

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