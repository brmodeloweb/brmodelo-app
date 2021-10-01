const mongoose = require("mongoose");
require("dotenv").config();
mongoose.Promise = require("bluebird");
const app = require("./server_app/app");

const port = Number(process.env.PORT);
const apiUrl = `${process.env.API_URL}:${port}`;
const mongoUrl = process.env.PROD_MONGODB || process.env.MONGODB_LOCAL_URL || process.env.MONGO_URI;
const isDevelopment = process.env.NODE_ENV === "development";

mongoose.set("debug", true);
mongoose.connect(
	mongoUrl,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	function (err) {
		if (err) throw err;

		const databaseInfo = isDevelopment ? `Database: ${mongoUrl}\n` : "";

		app.listen(port, function () {
			console.log(`
			---------------------------------------------------
			--------------- APPLICATION RUNNING ---------------
			---------------------------------------------------

			App: ${apiUrl}
			${databaseInfo}
			---------------------------------------------------
		`);
		});
	}
);