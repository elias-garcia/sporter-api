const User = require('../user/user.model');
const userService = require('./user.service');
const http = require('../../util/http');
const ApiError = require('../api-error');

const create = async (req, res, next) => {

  try {
    const session = await userService.register(req.body);

    return http.sendData(res, 'session', session);
  } catch(err) {
    return next(err);
  }

};

const find = async (req, res, next) => {

  try {
    const user = await userService.findById(req.params.userId)

    return http.sendData(res, 'user', user)
  } catch(err) {
    return next(err);
  }
  
};

const update = async (req, res, next) => {

  try {
    const user = await userService.update(req.params.userId, req.body, req.payload);

    return http.sendEmpty(res);
  } catch(err) {
    return next(err);
  }

};

const remove = async (req, res, next) => {
  
  try {
    await userService.remove(req.params.userId, req.payload);

    return http.sendEmpty(res);
  } catch(err) {
    return next(err);
  }
};

module.exports = {
  create,
  find,
  update,
  remove
};
