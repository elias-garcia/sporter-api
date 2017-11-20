/* eslint-disable func-names */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
  },
}, { timestamps: true });

userSchema.pre('save', function (next) {
  const user = this;

  if (!user.isModified('password')) {
    return next();
  }

  try {
    this.password = bcrypt.hashSync(user.password, 10);
  } catch (err) {
    return next(err);
  }

  return next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;