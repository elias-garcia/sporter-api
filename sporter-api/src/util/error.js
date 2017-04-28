const http = require('../util/http');
const ApiError = require('../api/api-error');

const handle404 = (req, res, next) => {
  return http.sendError(res, 404, 'resource not found');
};

const handle500 = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return http.sendError(res, err.status, err.message);
  }
  console.log(err);
  return http.sendError(res, 500, err.message);
};
module.exports = {
  handle404,
  handle500
};
