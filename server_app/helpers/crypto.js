const crypto = require("crypto");

const ALGORITHM = "aes-256-ctr";
const ENCRYPTION_KEY = process.env.SECRET_TOKEN;
const IV_LENGTH = 16;

const encrypt = (data) => {
	const key = crypto
		.createHash("sha256")
		.update(String(ENCRYPTION_KEY))
		.digest("base64")
		.substr(0, 32);
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);
	return Buffer.concat([iv, cipher.update(data), cipher.final()]);
};

const decrypt = (hash) => {
	const key = crypto
		.createHash("sha256")
		.update(String(ENCRYPTION_KEY))
		.digest("base64")
		.substr(0, 32);
	const iv = hash.slice(0, IV_LENGTH);
	const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), iv);
	const data = hash.slice(IV_LENGTH);
	const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
	return decrypted.toString();
};

const decode = (hash) => {
	return Buffer.from(hash, 'base64').toString('ascii');
};

module.exports = {
	encrypt,
	decrypt,
	decode
};
