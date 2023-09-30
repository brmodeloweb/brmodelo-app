const request = require("supertest");

const app = require("../app");
const mockUserService = require("./service");
jest.mock("./service");

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

describe("Test /users/login", () => {

  test("It should response 422 when validation password fails", async () => {
    const response = await request(app).post("/users/login").send({"username": "user", "password": ""});
    expect(response.statusCode).toBe(422);
  });

  test("It should response 422 when validation username fails", async () => {
    const response = await request(app).post("/users/login").send({"username": "user", "password": ""});
    expect(response.statusCode).toBe(422);
  });

  test("It should response 404 when not user found", async () => {
    const userParams = {"username": "user", "password": "123456"};
    mockUserService.login.mockResolvedValue(null);
    const response = await request(app).post("/users/login").send(userParams);
    expect(response.statusCode).toBe(404);
  });

  test("It should response 200 when user found", async () => {
    const userParams = {"username": "user", "password": "123456"};
    mockUserService.login.mockResolvedValue({
      "sessionId": "some_session_id",
      "userId": "123456",
      "userName": "someusername"
    });
    const response = await request(app).post("/users/login").send(userParams);
    expect(response.statusCode).toBe(200);
    expect(mockUserService.login).toHaveBeenCalled();
  });
});

describe("Test /users/create", () => {
  beforeEach(() => {
    jest.mock("./service");
  });

  test("It should response 422 when validation password fails", async () => {
    const response = await request(app).post("/users/create").send({"username": "user", "email": "mail@mail.com", "password": ""});
    expect(response.statusCode).toBe(422);
  });

  test("It should response 422 when validation username fails", async () => {
    const response = await request(app).post("/users/create").send({"username": "", "email": "mail@mail.com", "password": "123456"});
    expect(response.statusCode).toBe(422);
  });

  test("It should response 422 when validation email fails", async () => {
    const response = await request(app).post("/users/create").send({"username": "user", "email": "", "password": "123456"});
    expect(response.statusCode).toBe(422);
  });

  test("It should response 201 when user created", async () => {
    const response = await request(app).post("/users/create").send({"username": "user", "email": "mail@mail.com", "password": "123456"});
    mockUserService.create.mockResolvedValue({
      "userId": "123456",
      "userName": "someusername"
    });
    expect(response.statusCode).toBe(201);
    expect(mockUserService.create).toHaveBeenCalled();
  });

});


describe("Test /users/delete", () => {

  test("It should response 200 when user deleted", async () => {
    const response = await request(app)
		.delete("/users/delete")
		.set("brx-access-token", 'mockToken')
		.send({"userId": "63bb161ff8d5c483cb28047c"});
    mockUserService.deleteAccount.mockResolvedValueOnce(true);
    expect(response.statusCode).toBe(200);
    expect(mockUserService.deleteAccount).toHaveBeenCalled();
  });

  test("It should response 500 when user has created models", async () => {
    mockUserService.deleteAccount.mockReset();
    mockUserService.deleteAccount.mockRejectedValueOnce(new Error('Async error message'));
    const response = await request(app)
		.delete("/users/delete")
		.set("brx-access-token", 'mockToken')
		.send({ "userId": "63bb161ff8d5c483cb28047c" });
    expect(response.statusCode).toBe(500);
    expect(mockUserService.deleteAccount).toHaveBeenCalled();
  });

  test("It should response 400 when user has created models", async () => {
    const modelsError = new Error('Models Error');
    modelsError.code = "USER_HAS_MODELS_ERROR";

    mockUserService.deleteAccount.mockReset();
    mockUserService.deleteAccount.mockRejectedValueOnce(modelsError);
    const response = await request(app)
		.delete("/users/delete")
		.set("brx-access-token", 'mockToken')
		.send({ "userId": "63bb161ff8d5c483cb28047c" });
    expect(response.statusCode).toBe(400);
    expect(mockUserService.deleteAccount).toHaveBeenCalled();
  });

});
