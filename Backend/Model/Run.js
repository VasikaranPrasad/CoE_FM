// models/run.js
const mongoose = require('mongoose');

const runSchema = new mongoose.Schema({
  designName: String,
  runName: String,
  userName: String
});

module.exports = mongoose.model('Run', runSchema);
