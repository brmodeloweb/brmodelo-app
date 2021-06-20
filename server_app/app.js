const express = require("express");
const responseTime = require("response-time");
const errorhandler = require("errorhandler");
const morgan = require("morgan");
const session = require("express-session");
const bodyParser = require("body-parser");
const cors = require("cors");
const ejs = require("ejs");

let app = express();

if (process.env.NODE_ENV === 'production') {
	const webpack = require('webpack');
	const config = require('../webpack.config.js');
	const compiler = webpack(config);
	
	const webpackDevMiddleware = require('webpack-dev-middleware');
	const webpackHotMiddleware = require('webpack-hot-middleware');
	
	app.use(webpackDevMiddleware(compiler, {
			publicPath: config.output.publicPath,
		})
	)
	
	app.use(webpackHotMiddleware(compiler))
};

app.engine("html", ejs.renderFile);

app.use(morgan("dev"));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(responseTime());
app.use(cors());
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
