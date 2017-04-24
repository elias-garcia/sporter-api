const http = require('../util/http');

const acceptJson = (req, res, next) => {
  const contentType = req.get('Content-Type');

  if (!contentType || contentType != 'application/json') {
    return res.status(415).json(http.createError(415, 'unsupported media type'));
  }

  next();
};

module.exports = acceptJson;