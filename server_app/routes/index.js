let modelRouter = require("./modelRouter.js")
let userRouter = require("./userRouter.js")

module.exports = exports = function(app, helper) {
	// A route for the home page
	app.get("/", function(req, res) {
		res.render("index.html")
	})

	app.use("/models", modelRouter)
	app.use("/users", userRouter)
}
