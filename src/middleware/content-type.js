const json = require('../util/json');

const acceptJson = (req, res, next) => {
  const contentType = req.get('Content-Type');

  if (req.method.toUpperCase() !== 'OPTIONS' &&
    (!contentType || contentType !== 'application/json')) {
    return res.status(415).json(json.createError(415, 'unsupported media type'));
  }

  return next();
};

const setJson = (req, res, next) => {
  if (req.method.toUpperCase() !== 'OPTIONS') {
    res.set('Content-Type', 'application/json');
  }

  return next();
};

module.exports = {
  acceptJson,
  setJson,
};
