const request = require("supertest");
const app = require("../app");
jest.mock("./service");
const mockModelService = require("./service");

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
		const response = await request(app)
			.get("/")
			.send([]);
		expect(response.statusCode).toBe(200);
	});
});
