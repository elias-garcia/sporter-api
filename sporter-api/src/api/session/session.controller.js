const User = require('../user/user.model');
const crypto = require('../../util/crypto');
const jwt = require('jsonwebtoken');
const appConfig = require('../../config/app.config');
const http = require('../../util/http');
const rest = require('../../util/rest');
const ApiError = require('../api-error');

const logIn = (req, res, next) => {
  User.findOne({ email: req.body.email }).exec().then(user => {
    if (!user) {
      throw new ApiError(401, 'invalid email');
    }
    if (crypto.decrypt(user.password) !== req.body.password) {
      throw new ApiError(401, 'invalid password');
    }
    const token = jwt.sign({ sub: user._id }, appConfig.jwtSecret,
      { expiresIn: appConfig.jwtMaxAge });
    return http.sendData(res, 'session', { _id: user._id, token: token });
  }).catch(err => {
    return next(err);
  });
};

const session = (req, res, next) => {
  rest.restful(req, res, next, {
    post: logIn
  });
};

module.exports = {
  session
};
