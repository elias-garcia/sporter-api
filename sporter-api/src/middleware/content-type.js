const http = require('../util/http');

const acceptJson = (req, res, next) => {
  const contentType = req.get('Content-Type');

  if (!contentType || contentType != 'application/json') {
    return http.sendError(res, 415, 'unsupported media type');
  }
  
  return next();
};

const setJson = (req, res, next) => {
  res.set('Content-Type', 'application/json');
  
  return next();
};

module.exports = {
  acceptJson,
  setJson
};