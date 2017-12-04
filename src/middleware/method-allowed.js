const ApiError = require('../api/api-error');

const allowedMethods = ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'];

const methodAllowed = (req, res, next) => {
  if (!allowedMethods.includes(req.method.toUpperCase())) {
    return next(new ApiError(405, 'method not allowed'));
  }

  return next();
};

module.exports = methodAllowed;
