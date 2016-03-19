var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var ModelSchema = mongoose.model('Model');
var router = express.Router();
var modelRouter = express.Router();

modelRouter.use(bodyParser.json());

modelRouter.route('/')
.get(function(req,res,next){
	var Model = mongoose.model('Model', ModelSchema);
	var userId = req.query.userId;
	Model.find({'who': userId}, function(err, models) {
		res.send(models);
	});
})

.post(function(req, res, next) {
	var _name = req.body.name;
	var _type = req.body.type;
	var _model = req.body.model;
	var _user = req.body.user;

	var Model = mongoose.model('Model', ModelSchema);
	var model = new Model({
		who: _user,
		type: _type,
		model: _model,
		name: _name
	});

	Model.create(model, function(err, newModel) {
		if (err) {
			console.log(err);
		} else {
			res.send(newModel);
		}
	});
});

modelRouter.route('/:modelId')
.get(function(req,res,next){
	//res.end('Will send details of the dish: ' + req.params.modelId +' to you!');
	var modelId = req.query.modelId;
	var userId = req.query.userId;
	var Model = mongoose.model('Model', ModelSchema);
	Model.find({'who': userId, '_id': modelId}, function(err, model){
		if(err)
			console.log(err);
		res.send(model);
	});

})

.put(function(req, res, next){
	var Model = mongoose.model('Model', ModelSchema);
	Model.findOne({'_id': req.body.id}, function(err, model){
		if(err)
			console.log(err);

		model.model = req.body.model;
		model.name = req.body.name;
		model.save(function (err) {
			if(err) console.log(err);
			res.send(model);
		});
	})
})

.delete(function(req, res, next){
	var Model = mongoose.model('Model', ModelSchema);
	Model.find({'_id': req.query.modelId}).remove(function (err) {
		if (err) {
			console.log(err);
			res.sendStatus(404);
		}
		res.sendStatus(200);
	});
});

module.exports = modelRouter;