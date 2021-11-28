const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  login: { type: String },
  name: { type: String },
  password: { type: String },
  recoveryCode: { type: String },
	created: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);