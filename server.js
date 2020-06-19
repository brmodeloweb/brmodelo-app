const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const app = require("./server_app/app");

let port = Number(process.env.PORT || 3000);

let mongoport = process.env.PROD_MONGODB || "mongodb://localhost:27017/brmodeloDB"
// https://mlab.com/

mongoose.set("debug", true)
mongoose.connect(mongoport, {useNewUrlParser: true, useUnifiedTopology: true}, function (err) {
	if (err) throw err
		app.listen(port, function () {
			console.log(`
---------------------------------------------------
--------------- APPLICATION RUNNING ---------------
---------------------------------------------------
App: http://localhost:${port}
MongoDB: ${mongoport}
---------------------------------------------------
		`)
	})
})