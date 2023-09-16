class BrError extends Error {
	constructor (message) {
		super(message)
		Error.captureStackTrace(this, this.constructor);

		this.name = this.constructor.name
		this.status = 404
	  }

	  statusCode() {
		return this.status
	  }
}

function BrError (message, code) {
	return {
		"message": message,
		"code": 401,
		"type":
	}
}