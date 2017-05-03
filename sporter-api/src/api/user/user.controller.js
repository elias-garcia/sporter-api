const User = require('../user/user.model');
const jwt = require('jsonwebtoken');
const appConfig = require('../../config/app.config');
const auth = require('../../util/auth');
const http = require('../../util/http');
const rest = require('../../util/rest');
const ApiError = require('../api-error');

const register = (req, res, next) => {
  User.findOne({ email: req.body.email }).exec().then(user => {
    if (user) {
      throw new ApiError(409, 'user already exists');
    }
    return User.create(req.body);
  }).then(user => {
    const token = auth.signToken(user._id);
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
    User.findById(req.params.userId).exec().then(user => {
      if (!user) {
        throw new ApiError(404, 'user not found');
      }
      auth.authorize(req.params.userId, req.get('Authorization'));
      return user.update(req.body);
    }).then(user => {
      return http.sendEmpty(res);
    }).catch(err => {
      return next(err);
    });
};

const remove = (req, res, next) => {
  User.findById(req.params.userId).exec().then(user => {
    if (!user) {
      throw new ApiError(404, 'user not found');
    }
    auth.authorize(req.params.userId, req.get('Authorization'));
    return user.remove();
  }).then(user => {
    return http.sendEmpty(res);
  }).catch(err => {
    return next(err);
  });
};

const users = (req, res, next) => {
  rest.restful(req, res, next, {
    post: register
  });
};

const user = (req, res, next) => {
  rest.restful(req, res, next, {
    get: find,
    put: update,
    delete: remove
  });
};

module.exports = {
  users,
  user
};
