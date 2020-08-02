jest.mock("../user/service");
const mockUserService = require("../user/service");
const authService = require("./service");
describe("login", () => {
    const docResponse = {
        id: '507f191e810c19729de860ea',
        name: 'name',
        login: 'user@mail.com',
        password: '123456' 
      };
    test('should return user when login params match', async () => {
      const userParam = {username: 'user@mail.com', password: "123456"};
    
      mockUserService.find.mockResolvedValue(docResponse);
    
      const userSession = await authService.login(userParam);
    
      const expectedResponse = {
        "userId": "507f191e810c19729de860ea",
        "userName": "name"
      }
    
      expect(userSession).toMatchObject(expectedResponse);
    });
    
    test('should return null when login not found', async () => {
      const userParam = {username: 'user@mail.com', password: "123456", sessionId:"123456"};
    
      mockUserService.find.mockResolvedValue(null);
    
      const userSession = await authService.login(userParam);
    
      expect(userSession).toBeNull();
    });
    
    test('should catch error when service fires it', async () => {
      const userParam = {username: 'user@mail.com', password: "123456", sessionId:"123456"};
    
      mockUserService.find.mockResolvedValue(docResponse);
    
      expect(() => {
        authService.login(userParam).toThrow();
      });
    });
    
  });
  