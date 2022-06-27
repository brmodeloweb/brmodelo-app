const express = require("express");
const responseTime = require("response-time");
const errorhandler = require("errorhandler");
const morgan = require("morgan");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

require("dotenv").config();

let app = express();

// Where to find the view files
const viewsPath = path.join(__dirname, "../views");
app.set("views", viewsPath);

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

const forceSsl = function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    return next();
 };

if (process.env.NODE_ENV === "production") {
    app.use(forceSsl);
}

module.exports = app;