const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  login: { type: String },
  name: { type: String },
  password: { type: String },
  recoveryCode: { type: String }
});

module.exports = mongoose.model("User", userSchema);