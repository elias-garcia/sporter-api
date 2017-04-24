const http = require('../util/http');

const handle404 = (req, res, next) => {
  return res.status(404).json(http.createError(404, 'resource not found'));
};

const handle500 = (err, req, res, next) => {
  console.log(err);
  return res.status(500).json(http.createError(500, err.message));
};

module.exports = {
  handle404,
  handle500
};
