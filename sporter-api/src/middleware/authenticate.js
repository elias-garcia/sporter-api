const jwt = require('jsonwebtoken');
const appConfig = require('../config/app.config');
const http = require('../util/http');
const ApiError = require('../api/api-error');

const authenticate = (req, res, next) => {
  const auth = req.get('Authorization');

  if (auth) {
    const token = auth.split(' ')[1];
    try {
      jwt.verify(token, appConfig.jwtSecret, { maxAge: appConfig.jwtMaxAge });
    } catch (err) {
      return next(new ApiError(401, 'authorization token not valid'));
    }
    return next();
  }
  return next(new ApiError(401, 'you need to provide an authentication token'));
};

module.exports = authenticate;
