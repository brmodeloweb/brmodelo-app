let express = require("express")
let mongoose = require("mongoose")
let bodyParser = require("body-parser")
let helper = require("../helpers")
let UserSchema = mongoose.model("User").schema
let userRouter = express.Router()
mongoose.Promise = require("bluebird")

userRouter.use(bodyParser.json())

userRouter.post("/login", function(req,res,next){

	let _username = req.body.username
	let _pass = req.body.password
	_pass = helper.Crypto(_pass, _username)

	let User = mongoose.model("User", UserSchema)

	User.findOne({
		"login": _username,
		"password": _pass
	}, function(err, doc) {

		if (err) {
			console.error(error)
			return
		}

		if (doc != null) {
			req.session.userId = doc.id
			let user = {
				"sessionId": req.sessionID,
				"userId": doc.id,
				"userName": doc.name
			}
			res.json(user)
		} else {
			console.log("User not found")
			console.log(doc)
			res.sendStatus(404)
		}

	})

})

.post("/create", function(req, res, next) {
	console.log(req.body)

	let _name = req.body.username
	let _email = req.body.email
	let _pass = req.body.password

	_pass = helper.Crypto(_pass, _email)

	let User = mongoose.model("User", UserSchema)
	let user = new User({
		login: _email,
		name: _name,
		password: _pass
	})

	User.findOne({
		"login": _email
	}, function(err, doc) {
		if (doc == null) {
			User.create(user, function(err, newUser) {
				if (err) {
					console.log(err)
				} else {

				}
				res.sendStatus(200, "Deu boa esse registro")
			})
		} else {
			// implement user already exist
			res.sendStatus(409)
		}
	})
})

module.exports = userRouter
