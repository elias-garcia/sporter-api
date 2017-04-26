const User = require('../user/user.model');
const jwt = require('jsonwebtoken');
const appConfig = require('../../config/app.config');
const http = require('../../util/http');
const rest = require('../../util/rest');

const register = (req, res, next) => {
  User.findOne(req.params.email).exec().then(user => {
    if (user) {
      return res.status(409).json(http.createError(409, 'user already exists'));
    }
    return User.create(req.body);
  }).then(user => {
    const token = jwt.sign({
      sub: user._id,
    }, appConfig.jwtSecret, {
      expiresIn: appConfig.jwtMaxAge
    });
    return res.status(200).json(http.createData('session', {
      _id: user._id,
      token: token
    }));
  }).catch(err => {
    next(err);
  });
};

const find = (req, res, next) => {
  User.findById(req.params.userId,('-password -__v')).exec().then(user => {
    if (user) {
      return res.status(200).json(http.createData('user', user));
    }
    return res.status(404).send(http.createError(404, 'user not found'));
  }).catch(err => {
    return next(err);
  });
};

const update = (req, res, next) => {
  const auth = req.get('Authorization');

  if (auth) {
    const token = auth.split(' ')[1];
    const decoded = jwt.decode(token);
    User.findByIdAndUpdate(req.params.userId, req.body).exec().then(user => {
      return res.status(204);
    }).catch(err => {
      next(err);
    });
  }
};

const remove = (req, res, next) => {
  User.findByIdAndRemove(req.params.userId).exec().then(user => {
    return res.status(204);
  }).catch(err => {
    next(err);
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
