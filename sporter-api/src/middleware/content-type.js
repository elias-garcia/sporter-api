const http = require('../util/http');

const acceptJson = (req, res, next) => {
  const contentType = req.get('Content-Type');

  if (!contentType || contentType != 'application/json') {
    return http.sendError(415, 'unsupported media type');
  }
  
  return next();
};

module.exports = acceptJson;