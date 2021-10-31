const modelValidator = require("./validator");

describe("validateSaveModelParams test", () => {
	test("should fail when name is missing", () => {
		const validation = modelValidator.validateSaveParams({});
		expect(validation.valid).toBeFalsy();
		expect(validation.message).toBe(modelValidator.getMessages().MISSING_NAME);
	});

	test("should fail when name is empty", () => {
		const validation = modelValidator.validateSaveParams({ name: "" });
		expect(validation.valid).toBeFalsy();
		expect(validation.message).toBe(modelValidator.getMessages().MISSING_NAME);
	});

	test("should fail when name has a wrong type", () => {
		const validation = modelValidator.validateSaveParams({ name: 5 });
		expect(validation.valid).toBeFalsy();
		expect(validation.message).toBe(
			modelValidator.getMessages().WRONG_NAME_TYPE
		);
	});

	test("should fail when type is missing", () => {
		const validation = modelValidator.validateSaveParams({ name: "Teste" });
		expect(validation.valid).toBeFalsy();
		expect(validation.message).toBe(modelValidator.getMessages().MISSING_TYPE);
	});

	test("should fail when type is empty", () => {
		const validation = modelValidator.validateSaveParams({
			name: "Teste",
			type: "",
		});
		expect(validation.valid).toBeFalsy();
		expect(validation.message).toBe(modelValidator.getMessages().MISSING_TYPE);
	});

	test("should fail when model does not have a type", () => {
		const validation = modelValidator.validateSaveParams({
			name: "Teste",
			type: 5,
		});
		expect(validation.valid).toBeFalsy();
		expect(validation.message).toBe(
			modelValidator.getMessages().WRONG_TYPE_TYPE
		);
	});

	test("should fail when user is missing", () => {
		const validation = modelValidator.validateSaveParams({
			name: "Teste",
			type: "conceltual",
			model: { id: "1234" },
		});
		expect(validation.valid).toBeFalsy();
		expect(validation.message).toBe(modelValidator.getMessages().MISSING_USER);
	});

	test("should fail when user is 0", () => {
		const validation = modelValidator.validateSaveParams({
			name: "Teste",
			type: "conceltual",
			model: { id: "1234" },
			userId: "",
		});
		expect(validation.valid).toBeFalsy();
		expect(validation.message).toBe(modelValidator.getMessages().MISSING_USER);
	});

	test("should fail when userID has a wrong type", () => {
		const validation = modelValidator.validateSaveParams({
			name: "Teste",
			type: "conceptual",
			model: { id: "1234" },
			userId: 5,
		});
		expect(validation.valid).toBeFalsy();
		expect(validation.message).toBe(
			modelValidator.getMessages().WRONG_USER_TYPE
		);
	});
});
