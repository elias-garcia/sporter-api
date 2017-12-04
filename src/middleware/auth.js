const jwt = require('jsonwebtoken');
const appConfig = require('../config/app.config');
const ApiError = require('../api/api-error');

const auth = (req, res, next) => {
  const authHeader = req.get('authHeaderorization');

  if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, appConfig.jwtSecret, { maxAge: appConfig.jwtMaxAge });

      req.user = decoded;
    } catch (err) {
      return next(new ApiError(401, 'authHeaderorization token not valid'));
    }
    return next();
  }

  return next(new ApiError(401, 'you need to provide an authHeaderentication token'));
};

module.exports = auth;
