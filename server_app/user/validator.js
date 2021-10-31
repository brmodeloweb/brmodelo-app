const MESSAGES = {
	MISSING_USERNAME: "Missig username param",
	MISSING_PASSWORD: "Missig password param",
	MISSING_MAIL: "Missig mail param",
	VALID_PARAM: "Everything ok with your params",
};

class ValidationResponse {
	constructor(isValid, message) {
		this.valid = isValid;
		this.message = message;
	}
}

const validateLoginParams = ({ username, password }) => {
	if (username == "") {
		return new ValidationResponse(false, MESSAGES.MISSING_USERNAME);
	}

	if (password == "") {
		return new ValidationResponse(false, MESSAGES.MISSING_PASSWORD);
	}

	return new ValidationResponse(true, MESSAGES.VALID_PARAM);
};

const validateSignUpParams = ({ username, mail, password }) => {
	if (username == "") {
		return new ValidationResponse(false, MESSAGES.MISSING_USERNAME);
	}

	if (mail == "") {
		return new ValidationResponse(false, MESSAGES.MISSING_MAIL);
	}

	if (password == "") {
		return new ValidationResponse(false, MESSAGES.MISSING_PASSWORD);
	}

	return new ValidationResponse(true, MESSAGES.VALID_PARAM);
};

module.exports = {
	validateLoginParams,
	validateSignUpParams,
};
