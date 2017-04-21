const User = require('../user/user.model');
const crypto = require('../../util/crypto');
const jwt = require('jsonwebtoken');
const appConfig = require('../../config/app.config');
const http = require('../../util/http');

const logIn = (req, res, next) => {
  User.findOne(req.body.email).exec().then(user => {
    if (user) {
      if (crypto.decrypt(user.password) === req.body.password) {
        const token = jwt.sign({
          sub: user._id,
        }, appConfig.jwtSecret, {
          expiresIn: appConfig.jwtMaxAge
        });  
        res.status(200).json(http.createData(token));
      }
      res.status(401).json(http.createError(401, 'invalid password'));
    }
    res.status(401).json(http.createError(401, 'invalid email'));
  }).catch(err => {
    return next(err);
  });
};

module.exports = {
  logIn
};
