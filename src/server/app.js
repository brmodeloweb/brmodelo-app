const express = require("express");
const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const config = require("./config/environment");
const expressConfig = require("./config/express");
const registerRoutes = require("./routes");

mongoose.set("debug", true);
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on("error", (err) => {
	console.error(`MongoDB connection error: ${err}`);
	process.exit(-1); // eslint-disable-line no-process-exit
});

const app = express();

expressConfig(app);
registerRoutes(app);

app.listen(config.port, () => {
	console.log(`
---------------------------------------------------
--------------- APPLICATION RUNNING ---------------
---------------------------------------------------
App: http://localhost:${config.port}
MongoDB: ${config.mongo.uri}
---------------------------------------------------
		`);
});

module.exports = app;
