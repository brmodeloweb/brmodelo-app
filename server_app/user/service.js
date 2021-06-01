const UserRepository = require("./model");
const encriptor = require("../helpers");

const login = async ({username, password}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userDocument = await UserRepository.findOne({
        "login": username,
        "password": encriptor.Crypto(password, username),
      });
    
      if(userDocument != null) {
        return resolve({
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

const recovery = async (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await UserRepository.findOne({"login": email});

      if(user == null) {
        return reject({"code": "USER_DO_NOT_EXISTS"});
      }

      const recoveryCode = Math.floor(Math.random() * 10000000000) + 1; ;

      const update = await UserRepository.updateOne(
				{ login: email },
				{ $set: { recoveryCode: recoveryCode } }
			);
    
			if (update.ok) {
				return resolve(update);
			}

			return reject();
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}

const userService = {
  login,
  create,
  recovery
};

module.exports = userService;