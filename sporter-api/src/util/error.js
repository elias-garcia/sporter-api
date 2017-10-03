/* eslint-disable no-unused-vars */
const json = require('../util/json');
const ApiError = require('../api/api-error');

const handler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json(json.createError(err.status, err.message));
  }
  console.log(err);
  return res.status(500).json(json.createError(500, err.message));
};

module.exports = {
  handler,
};
