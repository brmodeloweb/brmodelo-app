const express = require("express");
const errorhandler = require("errorhandler");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const enforce = require('express-sslify');

require("dotenv").config();

let app = express();
app.use(cors());

if (app.get("env") === "production") {
	app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

// Where to find the view files
const viewsPath = path.join(__dirname, "../views");
app.set("views", viewsPath);

app.use(bodyParser.json({limit: '50mb'})); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb'})); // support encoded bodies

const appPath = path.join(__dirname, "../app");
app.use(express.static(`${appPath}/dist`));

app.use(
	session({
		resave: true,
		saveUninitialized: true,
		secret: "SOMERANDOMSECRETHERE",
		cookie: { maxAge: 60000 },
	})
);
app.use(errorhandler());

const userHandler = require("./user/handler");
const modelHandler = require("./model/handler");


app.use("/users", userHandler);
app.use("/models", modelHandler);

app.get("/", (_, res) => {
	res.render("index.html");
});

module.exports = app;