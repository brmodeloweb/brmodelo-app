const express = require("express")
const responseTime = require("response-time")
const errorhandler = require("errorhandler")
const morgan = require("morgan")
const session = require("express-session")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const path = require("path")
const config = require("./environment");

const expressConfig = (app) => {
	// Where to find the view files
	const viewsPath = path.join(__dirname, "../../../views");
	app.set("views", viewsPath);
	app.engine("html", ejs.renderFile);

	app.use(morgan("dev"));
	app.use(bodyParser.json()); // support json encoded bodies
	app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
	const appPath = path.join(__dirname, "../../../app");
	app.use(express.static(appPath));
	app.use(express.static(`${appPath}/assets`));
	app.use(express.static(`${appPath}/assets/node_modules`));
	app.use(responseTime());
	app.use(
		session({
			resave: true,
			saveUninitialized: true,
			secret: config.secrets.session,
			cookie: { maxAge: 60000 },
		})
	);
	app.use(errorhandler());
};

module.exports = expressConfig;
