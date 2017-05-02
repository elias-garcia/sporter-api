const http = require('../util/http');
const ApiError = require('../api/api-error');

const acceptJson = (req, res, next) => {
  const contentType = req.get('Content-Type');

  try {
    if (!contentType || contentType != 'application/json') {
      throw new ApiError(415, 'unsupported media type');
    }
  } catch (err) {
    return next(err);
  }
  
  return next();
};

module.exports = acceptJson;