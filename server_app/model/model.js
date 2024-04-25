const mongoose = require("mongoose");

let ShareOptions = mongoose.Schema({
	active: {type: Boolean, required: true},
	importAllowed: {type: Boolean, required: true}
});

let model = mongoose.Schema({
	who: { type: String, required: true },
	name: { type: String, required: true },
	created: { type: Date, default: Date.now },
	updated: { type: Date, default: Date.now },
	model: { type: Object, required: true },
	type: { type: String, required: true },
	shareOptions: { type: ShareOptions, required: false }
});

module.exports = mongoose.model("Model", model);