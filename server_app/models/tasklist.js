var mongoose = require('mongoose');

var Task = mongoose.Schema({
    id: { type: String, required: true}
  , text: { type: String, required: true}
  , created: {type: Date, default: Date.now}
  , done: {type: Boolean}
  , due: {type: Date}
  , tag: [String]
});

var TaskList = mongoose.Schema({
    owner: { type: String, required: true}
  , tasklistname: { type: String, required: true}
  , created: {type: Date, default: Date.now}
  , due: {type: Date}
  , tasks: [Task]
});

module.exports = mongoose.model('TaskList', TaskList);
