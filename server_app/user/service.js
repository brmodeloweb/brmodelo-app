const UserRepository = require("./model");
const encriptor = require("../helpers");
const mailSender = require("../mail/sender");
const modelService = require("../model/service");

const login = async ({ username, password }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userDocument = await UserRepository.findOne({
        "login": username,
        "password": encriptor.Crypto(password, username),
      });

      if (userDocument != null) {
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

const create = async ({ username, password, mail }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await UserRepository.findOne({ "login": mail });

      if (user != null) {
        return reject({ "code": "USER_ERROR_ALREADY_EXISTS" });
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
      const user = await UserRepository.findOne({ "login": email });

      if (user == null) {
        return reject({ "code": "USER_DO_NOT_EXISTS" });
      }

      const recoveryCode = Math.floor(Math.random() * 10000000000) + 1;

      const recoveredUser = await UserRepository.findOneAndUpdate(
        { login: email },
        { $set: { recoveryCode: recoveryCode } }
      );

      if (recoveredUser != null) {
        mailSender.recovery(email, recoveryCode)
          .then(response => {
            console.log(response);
            return resolve(recoveredUser)
          })
          .catch(error => {
            console.log(error);
            return reject(error);
          })

        return resolve(recoveredUser);
      }

      return reject();
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}

const isValidRecovery = async (mail, code) => {
  try {
    const user = await UserRepository.findOne({ "login": mail, "recoveryCode": code });

    if (user == null) {
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);
    return error;
  }
}

const resetPassword = async (mail, code, newPassword) => {
  return new Promise(async (resolve, reject) => {
    try {

      const isValid = await isValidRecovery(mail, code)
      if (!isValid) {
        return reject(new Error("Invalid recovery code"));
      }

      const response = await UserRepository.findOneAndUpdate(
        { login: mail, recoveryCode: code },
        { $set: { password: encriptor.Crypto(newPassword, mail), recoveryCode: null } }
      );

      if(response == null) {
        return reject(new Error("Error reseting password"));
      }

      resolve();
    } catch (error) {
      console.error(error);
      reject(error);
    }

  });
}

const deleteAccount = async (userId) => {
	return new Promise(async (resolve, reject) => {
		try {

      const modelsCount = await modelService.countAll(userId);
      if(modelsCount > 0) {
        const countError = new Error("Operation not allowed. User has models");
        countError.code = "USER_HAS_MODELS_ERROR";
        return reject(countError);
      }

			const deletedInfo = await UserRepository.deleteOne(
				{ "_id": userId },
			)

			if (deletedInfo.deletedCount === 0) {
				return reject(new Error("Error deleting account"));
			}

			resolve(true);
		} catch (error) {
			console.error(error);
			reject(error);
		}

	});
}

const userService = {
	login,
	create,
	recovery,
	isValidRecovery,
	resetPassword,
	deleteAccount
};

module.exports = userService;