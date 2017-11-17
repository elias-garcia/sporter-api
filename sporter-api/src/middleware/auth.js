const jwt = require('jsonwebtoken');
const appConfig = require('../config/app.config');
const ApiError = require('../api/api-error');

const authenticate = (req, res, next) => {
  const auth = req.get('Authorization');

  if (auth && auth.split(' ')[0] === 'Bearer') {
    const token = auth.split(' ')[1];
    try {
      const decoded = jwt.verify(token, appConfig.jwtSecret, { maxAge: appConfig.jwtMaxAge });

      req.user = decoded;
    } catch (err) {
      return next(new ApiError(401, 'authorization token not valid'));
    }
    return next();
  }

  return next(new ApiError(401, 'you need to provide an authentication token'));
};

module.exports = authenticate;
