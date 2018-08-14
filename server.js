const express = require("express")
const responseTime = require("response-time")
const errorhandler = require("errorhandler")
const morgan = require("morgan")
const mongoose = require("mongoose")
const session = require("express-session")
const bodyParser = require("body-parser")

let app = module.exports.app = exports.app = express()

// Where to find the view files
app.set("views", "./views")
app.engine("html", require("ejs").renderFile)

app.use(morgan("dev"))
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies
app.use(express.static("./app"))
app.use(express.static("./build"))
app.use(express.static("./node_modules"))
app.use(express.static("./bower_components"))
app.use(responseTime())
app.use(session({resave: true, saveUninitialized: true, secret: "SOMERANDOMSECRETHERE", cookie: { maxAge: 60000 }}))
app.use(errorhandler())

let models  = require("./server_app/models")
let routes  = require("./server_app/routes")(app)

let port = Number(process.env.PORT || 3000)

let mongoport = process.env.PROD_MONGODB || "mongodb://localhost:27017/brmodeloDB"
// https://mlab.com/

mongoose.set("debug", true)
mongoose.connect(mongoport, function (err) {
 if (err) throw err
  app.listen(port, function () {
    console.log(`--------------------------------------------------
Application running on http://localhost:${port}
MongoDB running on ${mongoport}
--------------------------------------------------`)
  })
})
