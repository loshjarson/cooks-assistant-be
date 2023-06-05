const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  fileId: mongoose.Schema.Types.ObjectId,
});

module.exports = mongoose.model('Image', imageSchema);