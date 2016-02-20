
var mongoose = require('mongoose');
var UserSchema = mongoose.model('User');
var ModelSchema = mongoose.model('Model');

module.exports = exports = function(app, helper) {
	// A route for the home page
	app.get('/', function(req, res) {
		res.render('index.html');
	});

	app.post('/login', function(req, res) {

		var _username = req.body.username;
		var _pass = req.body.password;
		_pass = helper.Crypto(_pass, _username);

		var User = mongoose.model('User', UserSchema);

		User.findOne({
			'login': _username,
			'password': _pass
		}, function(err, doc) {

			if (err) {
				console.error(error);
				return;
			}

			if (doc != null) {
				req.session.userId = doc.id;
				var user = {
					'sessionId': req.sessionID,
					'userId': doc.id,
					'userName': doc.name
				}
				res.json(user);
			} else {
				console.log("User not found");
				console.log(doc);
				res.sendStatus(404);
			}

		});

	});

	app.post('/createUser', function(req, res) {
		console.log(req.body);

		var _name = req.body.username;
		var _email = req.body.email;
		var _pass = req.body.password;

		_pass = helper.Crypto(_pass, _email);

		var User = mongoose.model('User', UserSchema);
		var user = new User({
			login: _email,
			name: _name,
			password: _pass
		});

		User.findOne({
			'login': _email
		}, function(err, doc) {
			if (doc == null) {
				User.create(user, function(err, newUser) {
					if (err) {
						console.log(err);
					} else {

					}
					res.sendStatus(200, "Deu boa esse registro");
				});
			} else {
				// implement user already exist
				res.sendStatus(409);
			}
		});
	});


	app.post('/saveModel', function(req, res) {
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
				res.sendStatus(200, "Deu boa esse save");
			}
		});
	});

	app.get('/getAllModels', function(req, res) {
		var Model = mongoose.model('Model', ModelSchema);
		Model.find({}, function(err, models) {
			res.send(models);
		});
	});

	app.get('/getModel', function(req, resp){
	  var modelId = req.query.modelId;
		var userId = req.query.userId;
    var Model = mongoose.model('Model', ModelSchema);
    Model.find({'who': userId, '_id': modelId}, function(err, model){
      if(err)
        console.log(err);
      resp.send(model);
    })
  });

	app.put('/updateModel', function(req, resp){
		var Model = mongoose.model('Model', ModelSchema);
		console.log(req.body.user);
		console.log(req.body.id);
		Model.findOne({'_id': req.body.id}, function(err, model){

			console.log('#### RESP: ' + model);

			if(err)
				console.log(err);

			model.model = req.body.model;
			model.save(function (err) {
				if(err) console.log(err);
				resp.send(model);
			});
		})
	});

}
