const mongoose = require('mongoose');
const crypto = require('../../util/crypto');

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
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  location: {
    type: String
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

userSchema.pre('save', function(next) {
  const user = this;
console.log(this);
  if (!user.isModified('password')) {
    return next();
  }

  try {
    this.password = crypto.encrypt(user.password);
  } catch (err) {
    return next(err);
  }

  return next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
