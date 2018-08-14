const mongoose = require("mongoose")
mongoose.Promise = require("bluebird")

let schema = mongoose.Schema({
  login: { type: String },
  name: { type: String },
  password: { type: String }
})

module.exports = mongoose.model("User", schema)
