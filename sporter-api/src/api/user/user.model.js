const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  location: {
    type: String
  },
  timestamps: {
    createdAt: {
      type: Date,
      required: true,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now()
    }
  }
});

const User = new mongoose.Model('user', userSchema);

module.exports = User;
