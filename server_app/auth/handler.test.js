const request = require("supertest");
const app = require("../app");
jest.mock("./service");
const mockAuthService = require("./service");

describe("Test /auth/login", () => {
    test("It should response 422 when validation password fails", async () => {
      const response = await request(app).post("/auth/login").send({"username": "user", "password": ""});
      expect(response.statusCode).toBe(422);
    });
  
    test("It should response 422 when validation username fails", async () => {
      const response = await request(app).post("/auth/login").send({"username": "user", "password": ""});
      expect(response.statusCode).toBe(422);
    });
  
    test("It should response 404 when not user found", async () => {
      const userParams = {"username": "user", "password": "123456"};
      mockAuthService.login.mockResolvedValue(null);
      const response = await request(app).post("/auth/login").send(userParams);
      expect(response.statusCode).toBe(404);
    });
  
    test("It should response 200 when user found", async () => {
      const userParams = {"username": "user", "password": "123456"};
      mockAuthService.login.mockResolvedValue({
        "sessionId": "some_session_id",
        "userId": "123456",
        "userName": "someusername"
      });
      const response = await request(app).post("/auth/login").send(userParams);
      expect(response.statusCode).toBe(200);
      expect(mockAuthService.login).toHaveBeenCalled();
    });
  });