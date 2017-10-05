const mongoose = require('mongoose');

const sportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const sportModel = mongoose.model('Sport', sportSchema);

module.exports = sportModel;
