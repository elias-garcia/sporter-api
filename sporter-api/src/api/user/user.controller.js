const User = require('../user/user.model');
const jwt = require('jsonwebtoken');
const appConfig = require('../../config/app.config');
const http = require('../../util/http');

const register = (req, res, next) => {
  User.create(req.body).then(user => {
    const token = jwt.sign({
        sub: user._id,
      }, appConfig.jwtSecret, {
        expiresIn: appConfig.jwtMaxAge
      });  
      res.status(200).json(http.createData('token', token));
  }).catch(err => {
    return next(err);
  });
};

const find = (req, res, next) => {
  User.findById(req.params.id, ('-password')).exec().then(user => {
    if (user) {
      res.status(200).json(http.createData(user));
    }
    res.status(404).send(http.createError(404, 'user not found'));
  }).catch(err => {
    return next(err);
  });
};

module.exports = {
  register,
  find
};
