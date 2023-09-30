const jwt = require('jsonwebtoken');
const { SecretToken } = require('../helpers/config');

exports.validateJWT = (req, res, next) => {
	const token = req.headers['brx-access-token'];
	if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

	jwt.verify(token, SecretToken, function(err, decoded) {
		if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });

		// if everything ok, save to request for use in other routes
		req.userId = decoded.id;
		next();
	});
}

