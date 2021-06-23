const express = require("express");
const responseTime = require("response-time");
const errorhandler = require("errorhandler");
const morgan = require("morgan");
const session = require("express-session");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const cors = require("cors");

let app = express();

// Where to find the view files
const viewsPath = path.join(__dirname, "../views");
app.set("views", viewsPath);
app.engine("html", ejs.renderFile);

app.use(morgan("dev"));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const appPath = path.join(__dirname, "../app");
app.use(express.static(`${appPath}/dist`));
app.use(responseTime());
app.use(
	session({
		resave: true,
		saveUninitialized: true,
		secret: "SOMERANDOMSECRETHERE",
		cookie: { maxAge: 60000 },
	})
);
app.use(errorhandler());
app.use(cors());

const userHandler = require("./user/handler");
const modelHandler = require("./model/handler");

app.use("/users", userHandler);
app.use("/models", modelHandler);

app.get("/", (_, res) => {
	res.render("index.html");
});

module.exports = app;