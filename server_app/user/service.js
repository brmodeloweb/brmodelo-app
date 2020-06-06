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
        resolve({
          "sessionId": sessionId,
          "userId": userDocument.id,
          "userName": userDocument.name
        });
      }

      resolve(null);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}

const userService = {
  login
};

module.exports = userService;