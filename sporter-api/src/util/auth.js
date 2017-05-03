const jwt = require('jsonwebtoken');
const appConfig = require('./../config/app.config');
const ApiError = require('../api/api-error');

const authorize = (userId, authHeader) => {

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, appConfig.jwtSecret, { maxAge: appConfig.jwtMaxAge });
      if (decoded.sub !== userId) {
        throw new ApiError(403, 'you are not allowed to access this resource');
      }
      return;
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(403, 'authorization token not valid');
    }
  }

  throw new ApiError(401, 'you need to provide an authentication token');

};

const signToken = (userId) => {

  return jwt.sign({ sub: userId }, appConfig.jwtSecret,
      { expiresIn: appConfig.jwtMaxAge });

};

module.exports = {
  authorize,
  signToken
};