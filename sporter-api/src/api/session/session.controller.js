const User = require('../user/user.model');
const crypto = require('../../util/crypto');
const jwt = require('jsonwebtoken');
const appConfig = require('../../config/app.config');


const logIn = (req, res, next) => {
  User.findOne(req.body).exec().then(user => {
    if (user) {
      const token = jwt.sign({
        sub: user.userId,
      }, appConfig.jwtSecret, {
        expiresIn: appConfig.jwtMaxAge
      });  
      res.status(200).send({
        token
      });
    }
    res.status(401).send();
  }).catch(err => {
    next(err);
  });
};

module.exports = {
  logIn
};
