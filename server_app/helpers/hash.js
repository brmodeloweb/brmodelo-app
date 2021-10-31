const crypto = require("crypto")

module.exports = function (pass, salt) {
	let hash = crypto.createHash("sha512")
	hash.update(pass, "utf8")
	hash.update(salt, "utf8")
	return hash.digest("base64")
}