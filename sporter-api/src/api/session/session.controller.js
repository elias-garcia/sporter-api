const User = require('../user/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const appConfig = require('../../config/app.config');
const http = require('../../util/http');
const ApiError = require('../api-error');

const logIn = (req, res, next) => {
  User.findOne({ email: req.body.email }).exec().then(user => {
    if (!user) {
      throw new ApiError(401, 'invalid email');
    }
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      throw new ApiError(401, 'invalid password');
    }
    const token = jwt.sign({ sub: user._id }, appConfig.jwtSecret,
      { expiresIn: appConfig.jwtMaxAge });
    return http.sendData(res, 'session', { _id: user._id, token: token });
  }).catch(err => {
    return next(err);
  });
};

module.exports = {
  logIn
};
