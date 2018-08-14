let express = require("express")
let mongoose = require("mongoose")
let bodyParser = require("body-parser")
let ModelSchema = mongoose.model("Model").schema
let modelRouter = express.Router()
mongoose.Promise = require("bluebird")

modelRouter.use(bodyParser.json())

modelRouter.route("/")
.get(function(req,res,next){
	let Model = mongoose.model("Model", ModelSchema)
	let userId = req.query.userId
	Model.find({"who": userId}, function(err, models) {
		res.send(models)
	})
})

.post(function(req, res, next) {
	let _name = req.body.name
	let _type = req.body.type
	let _model = req.body.model
	let _user = req.body.user

	let Model = mongoose.model("Model", ModelSchema)
	let model = new Model({
		who: _user,
		type: _type,
		model: _model,
		name: _name
	})

	Model.create(model, function(err, newModel) {
		if (err) {
			console.log(err)
		} else {
			res.send(newModel)
		}
	})
})

modelRouter.route("/:modelId")
.get(function(req,res,next){
	//res.end("Will send details of the dish: " + req.params.modelId +" to you!")
	let modelId = req.query.modelId
	let userId = req.query.userId
	let Model = mongoose.model("Model", ModelSchema)
	Model.find({"who": userId, "_id": modelId}, function(err, model){
		if(err)
			console.log(err)
		res.send(model)
	})

})

.put(function(req, res, next){
	let Model = mongoose.model("Model", ModelSchema)
	Model.findOne({"_id": req.body.id}, function(err, model){
		if(err)
			console.log(err)

		model.model = req.body.model
		model.name = req.body.name
		model.save(function (err) {
			if(err) console.log(err)
			res.send(model)
		})
	})
})

.delete(function(req, res, next){
	let Model = mongoose.model("Model", ModelSchema)
	Model.find({"_id": req.query.modelId}).remove(function (err) {
		if (err) {
			console.log(err)
			res.sendStatus(404)
		}
		res.sendStatus(200)
	})
})

module.exports = modelRouter
