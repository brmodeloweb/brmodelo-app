const users = require("./user/handler");
const models = require("./routes/modelRouter");

const registerRoutes = (app) => {
	app.use("/users", users);
	app.use("/models", models);
	app.get("/", (req, res) => {
		res.render("index.html");
	});
};

module.exports = registerRoutes;
