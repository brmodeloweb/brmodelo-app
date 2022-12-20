const mongoose = require("mongoose");
require("dotenv").config();
const app = require("./server_app/app");
const config = require("./server_app/helpers/config");
const { Port, MongoUrl, ApiUrl, IsDevelopment } = config;

mongoose.set("debug", true);
mongoose.connect(
	MongoUrl,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	function (err) {
		if (err) throw err;

		const databaseInfo = IsDevelopment ? `Database: ${MongoUrl}\n` : "";

		app.listen(Port, function () {
			console.log(`
			---------------------------------------------------
			--------------- APPLICATION RUNNING ---------------
			---------------------------------------------------

			App: ${ApiUrl}
			${databaseInfo}
			---------------------------------------------------
		`);
		});
	}
);