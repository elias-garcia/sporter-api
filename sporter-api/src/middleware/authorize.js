const jwt = require('jsonwebtoken');
const appConfig = require('./../config/app.config');
const http = require('../util/http');

const authorize = (req, res, next) => {
  const auth = req.get('Authorization');
  const userId = req.params.userId;

  if (auth) {
    const token = auth.split(' ')[1];
    try {
      jwt.verify(token, appConfig.jwt,
        { subject: userId, maxAge: appConfig.jwtMaxAge });
      return next();
    } catch (err) {
      return http.sendError(403, 'you are not allowed to access this resource');
    }
  }
  return http.sendError(401, 'you need to provide an authentication token');
};

module.exports = authorize;
