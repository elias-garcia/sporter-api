const User = require('../user/user.model');
const jwt = require('jsonwebtoken');
const appConfig = require('../../config/app.config');
const http = require('../../util/http');
const ApiError = require('../api-error');


const register = (req, res, next) => {
  User.findOne({ email: req.body.email }).exec().then(user => {
    if (user) {
      throw new ApiError(409, 'user already exists');
    }
    return User.create(req.body);
  }).then(user => {
    const token = jwt.sign({ sub: user._id }, appConfig.jwtSecret,
      { expiresIn: appConfig.jwtMaxAge });;
    return http.sendData(res, 'session', { _id: user._id, token: token });
  }).catch(err => {
    return next(err);
  });
};

const find = (req, res, next) => {
  User.findById(req.params.userId, ('-password -__v')).exec().then(user => {
    if (!user) {
      throw new ApiError(404, 'user not found');
    }
    return http.sendData(res, 'user', user);
  }).catch(err => {
    return next(err);
  });
};

const update = (req, res, next) => {
  if (!req.payload || req.payload.sub !== req.params.userId) {
    return next(new ApiError(403, 'you are not allowed to access this resource'));
  }
  User.findById(req.params.userId).exec().then(user => {
    if (!user) {
      throw new ApiError(404, 'user not found');
    }
    return user.update(req.body);
  }).then(user => {
    return http.sendEmpty(res);
  }).catch(err => {
    return next(err);
  });
};

const remove = (req, res, next) => {
  if (!req.payload || req.payload.sub !== req.params.userId) {
    return next(new ApiError(403, 'you are not allowed to access this resource'));
  }
  User.findById(req.params.userId).exec().then(user => {
    if (!user) {
      throw new ApiError(404, 'user not found');
    }
    return user.remove();
  }).then(user => {
    return http.sendEmpty(res);
  }).catch(err => {
    return next(err);
  });
};

module.exports = {
  register,
  find,
  update,
  remove
};
