const http = require('../util/http');
const ApiError = require('../api/api-error');

const handle404 = (req, res, next) => {
  return http.sendError(404, 'resource not found');
};

const handle500 = (err, req, res, next) => {
  console.log(err);
  if (err instanceof ApiError) {
    return http.sendError(err.status, err.message);
  }
  return http.sendError(500, err.message);
};
module.exports = {
  handle404,
  handle500
};
