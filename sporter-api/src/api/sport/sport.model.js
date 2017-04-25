const mongoose = require('mongoose');

const sportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updatedAt' } });

const sportModel = mongoose.model('Sport', sportSchema);

module.exports = sportModel;