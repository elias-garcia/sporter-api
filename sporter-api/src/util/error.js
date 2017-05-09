const http = require('../util/http');
const ApiError = require('../api/api-error');

const handler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return http.sendError(res, err.status, err.message);
  }
  console.log(err);
  return http.sendError(res, 500, err.message);
};

module.exports = {
  handler
};
