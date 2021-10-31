const MESSAGES = {
	MISSING_NAME: "Missig model name param",
	WRONG_NAME_TYPE: "Name should be a String",
	MISSING_TYPE: "Missig type param",
	WRONG_TYPE_TYPE: "Type should be a String",
	MISSING_MODEL: "Missig model param",
	WRONG_MODEL_TYPE: "Model should be an Object",
	MISSING_USER: "Missig userId param",
	WRONG_USER_TYPE: "UserId should be an Object",
};

class ValidationResponse {
	constructor(isValid, message) {
		this.valid = isValid;
		this.message = message;
	}
}

const getMessages = () => {
	return MESSAGES;
};

const isString = (value) => typeof value === "string" || value instanceof String;
const isNull = (value) => value == null || value == "";

const validateSaveParams = ({ name, type, model, userId }) => {
	if (isNull(name)) {
		return new ValidationResponse(false, MESSAGES.MISSING_NAME);
	}

	if (!isString(name)) {
		return new ValidationResponse(false, MESSAGES.WRONG_NAME_TYPE);
	}

	if (isNull(type)) {
		return new ValidationResponse(false, MESSAGES.MISSING_TYPE);
	}

	if (!isString(type)) {
		return new ValidationResponse(false, MESSAGES.WRONG_TYPE_TYPE);
	}

	if (isNull(userId)) {
		return new ValidationResponse(false, MESSAGES.MISSING_USER);
	}

	if (!isString(userId)) {
		return new ValidationResponse(false, MESSAGES.WRONG_USER_TYPE);
	}

	return new ValidationResponse(true, MESSAGES.VALID_PARAM);
};

module.exports = {
	validateSaveParams,
	getMessages,
};
