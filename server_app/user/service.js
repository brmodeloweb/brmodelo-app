const UserRepository = require("./model");
const encriptor = require("../helpers");

const login = async ({username, password, sessionId}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userDocument = await UserRepository.findOne({
        "login": username,
        "password": encriptor.Crypto(password, username),
      });
    
      if(userDocument != null) {
        return resolve({
          "sessionId": sessionId,
          "userId": userDocument.id,
          "userName": userDocument.name
        });
      }

      return resolve(null);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}

const create = async ({username, password, mail}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await UserRepository.findOne({"login": mail});

      if(user != null) {
        return reject({"code": "USER_ERROR_ALREADY_EXISTS"});
      }

      const createdUser = await UserRepository.create({
        login: mail,
        name: username,
        password: encriptor.Crypto(password, mail)
      });
    
      return resolve(createdUser);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}

const userService = {
  login,
  create
};

module.exports = userService;