const path = require("path");

const all = {
	env: process.env.NODE_ENV,

	// Root path of server
	root: path.normalize(`${__dirname}/../../..`),

	// Server port
	port: process.env.PORT || 3000,

	// Secret for session, you will want to change this and make it an environment variable
	secrets: {
		session: "SOMERANDOMSECRETHERE",
	},

	// MongoDB connection options
	mongo: {
		options: { useNewUrlParser: true, useUnifiedTopology: true },
		useMongoClient: true,
		uri: process.env.MONGODB_URI || "mongodb://localhost:27017/brmodeloDB",
	},
};

module.exports = all;
