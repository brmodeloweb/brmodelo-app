const request = require("supertest");
const app = require("../app");
jest.mock("./service");
const mockUserService = require("./service");
describe("Test /users/create", () => {
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

  test("It should response 200 when user created", async () => {
    const response = await request(app).post("/users/create").send({"username": "user", "email": "mail@mail.com", "password": "123456"});
    mockUserService.create.mockResolvedValue({
      "userId": "123456",
      "userName": "someusername"
    });
    expect(response.statusCode).toBe(200);
    expect(mockUserService.create).toHaveBeenCalled();
  });

});
