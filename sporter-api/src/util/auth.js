const jwt = require('jsonwebtoken');
const appConfig = require('../config/app.config');
const ApiError = require('../api/api-error');

const authorize = (req) => {
  const userId = req.params.userId;
  const token = req.get('Authorization').split(' ')[1];

  try {
    jwt.verify(token, appConfig.jwtSecret,
      { subject: userId });
  } catch (err) {
    throw new ApiError(403, 'you are not allowed to access this resource');
  }

  return;
};

module.exports = {
  authorize
};