const getRawBody = require("raw-body");

const uploadMiddleware = (req, res, next) => {
	if (req.headers["content-type"] === "application/octet-stream") {
		const options = {
			length: req.headers["content-length"],
			encoding: req.charset,
		};
		const callback = (err, string) => {
			if (err) return next(err);
			req.body = string;
			return next();
		};
		getRawBody(req, options, callback);
	} else {
		next();
	}
};

module.exports = {
	uploadMiddleware,
};
