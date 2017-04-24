const jwt = require('jsonwebtoken');
const appConfig = require('./../config/app.config');
const http = require('../util/http');

const authorize = (req, res, next) => {

  const auth = req.get('Authorization');

  if (auth) {
    const token = auth.split(' ')[1];
    try {
      jwt.verify(token, appConfig.jwt);
      return next();
    } catch (err) {
      return res.status(401).json(
        http.createError(401, 'authorization token not valid'));
    }
  }

  return res.status(401).json(
    http.createError(401, 'you need to provide an authentication token'));

};

module.exports = authorize;
