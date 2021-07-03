const mongoose = require("mongoose");
require("dotenv").config();
mongoose.Promise = require("bluebird");
const app = require("./server_app/app");

const port = Number(process.env.PORT || 3000);
const apiUrl = process.env.API_URL || `http://localhost:${port}`;
const mongoUrl = process.env.PROD_MONGODB || process.env.MONGODB_URL;
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
