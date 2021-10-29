const { encrypt, decrypt } = require("./crypto");

describe("crypto test", () => {
	const OLD_ENV = process.env;

	beforeEach(() => {
		jest.resetModules();
		process.env = { ...OLD_ENV };
	});

	afterAll(() => {
		process.env = OLD_ENV;
	});

	test("Encrypt data", async () => {
		process.env.SECRET_TOKEN = "some_token";
		const data = { name: "some_name" };
		const json = JSON.stringify(data);

		const encrypted = encrypt(json);

		expect(encrypted).not.toBeNull();
	});

	test("Decrypt data", async () => {
		process.env.SECRET_TOKEN = "some_token";
		const data = { name: "some_name" };
		const json = JSON.stringify(data);

		const decrypted = decrypt(encrypt(json));

		expect(decrypted).not.toBeNull();
		expect(JSON.parse(decrypted)).toEqual(data);
	});
});
