const userService = require("./service");

jest.mock("./model");
jest.mock("../model/service");
const UserRepositoryMock = require("./model");
const ModelServiceMock = require("../model/service");

afterEach(() => {
  jest.restoreAllMocks();
});

describe("login", () => {

  test('should return user when login params match', async () => {
    const userParam = {username: 'user@mail.com', password: "123456"};
  
    const docResponse = {
        "id": "507f191e810c19729de860ea",
        "name": "name"
    };
  
    UserRepositoryMock.findOne.mockResolvedValue(docResponse);
  
    const userSession = await userService.login(userParam);
  
    const expectedResponse = {
      "userId": "507f191e810c19729de860ea",
      "userName": "name"
    }
  
    expect(userSession).toMatchObject(expectedResponse);
  });
  
  test('should return null when login not found', async () => {
    const userParam = {username: 'user@mail.com', password: "123456", sessionId:"123456"};
  
    UserRepositoryMock.findOne.mockResolvedValue(null);
  
    const userSession = await userService.login(userParam);
  
    expect(userSession).toBeNull();
  });
  
  test('should catch error when service fires it', async () => {
    const userParam = {username: 'user@mail.com', password: "123456", sessionId:"123456"};
  
    UserRepositoryMock.findOne.mockResolvedValue(new Error("find error"));
  
    expect(() => {
      userService.login(userParam).toThrow();
    });
  });
  
});

describe("create", () => {

  test('should toThrow error when user already exists', async () => {
    const userParam = {username: 'user@mail.com', password: "123456", sessionId:"123456"};
  
    const docResponse = {
      _id: '507f191e810c19729de860ea',
      name: 'name',
      login: 'user@mail.com',
      password: '123456' 
    };

    UserRepositoryMock.findOne.mockResolvedValue(docResponse);

    expect(() => {
      userService.create(userParam).toThrow();
    });
  
  });


  test('should create user when it does not exists yet', async () => {
    const userParam = {username: 'name', password: "123456", mail:"user@mail.com"};

    const docResponse = {
      _id: '507f191e810c19729de860ea',
      name: 'name',
      login: 'user@mail.com',
      password: '123456' 
    };
    
    UserRepositoryMock.findOne.mockResolvedValue(null);

    UserRepositoryMock.create.mockResolvedValue(docResponse);

    const createResponse = await userService.create(userParam);

    expect(createResponse.login).toBe(docResponse.login);
  });

});

describe("remove", () => {

  test('should toThrow error when user has models', async () => {

    ModelServiceMock.countAll.mockResolvedValue(1);

    expect(() => {
      userService.deleteAccount("123456").toThrow();
    });
  
  });


  test('should delete account', async () => {    
    ModelServiceMock.countAll.mockResolvedValue(0);

    UserRepositoryMock.deleteOne.mockResolvedValue({"deletedCount": 1});

    const deleteResponse = await userService.deleteAccount("507f191e810c19729de860ea");

    expect(deleteResponse).toBe(true);
  });

});

