const userService = require("../user/service");

const login = async ({ username, password }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await userService.find({username, password});
            if (user != null) {
                return resolve({
                    "userId": user.id,
                    "userName": user.name
                });
            }
            return resolve(null);
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}
const authService = {
    login
};

module.exports = authService