var mongoose = require('mongoose');
var UserSchema = mongoose.model('User');

module.exports = exports = function(app, helper) {
    // A route for the home page
    app.get('/', function(req, res){
      res.render('index.html');
    });

    app.post('/login', function(req, res){

      var _username = req.body.username;
      var _pass = req.body.password;
      _pass =  helper.Crypto(_pass, _username);

      var User = mongoose.model('User', UserSchema);

      User.findOne({'login': _username, 'password': _pass}, function (err, doc) {

        if(err) {
          console.error(error);
          return;
        }

        if(doc != null){
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

    app.post('/createUser', function(req, res){
      console.log(req.body);

      var _name = req.body.username;
      var _email = req.body.email;
      var _pass = req.body.password;

      _pass =  helper.Crypto(_pass, _email);

      var User = mongoose.model('User', UserSchema);
      var user = new User({login: _email, name: _name, password:_pass});

      User.findOne({ 'login': _email }, function (err, doc) {
          if(doc == null) {
              User.create(user, function (err, newUser) {
                if (err) {
                  console.log(err);
                } else{

                }
                res.sendStatus(200, "Deu boa esse registro");
              });
          } else {
            // implement user already exist
          }
      });

    });


    app.post('/addTask', function(req, res){
      console.log(req.body.msg);
      res.sendStatus(200);
    });


}
