const User = require('../user/user.model');
const userService = require('./user.service');
const json = require('../../util/json');
const ApiError = require('../api-error');

const create = async (req, res, next) => {

  try {
    const session = await userService.register(req.body);
    return res.status(200).json(json.createData('session', session));
  } catch(err) {
    return next(err);
  }

};

const find = async (req, res, next) => {

  try {
    const user = await userService.findById(req.params.userId);
    return res.status(200).json(json.createData('user', user));
  } catch(err) {
    return next(err);
  }
  
};

const update = async (req, res, next) => {

  try {
    const user = await userService.update(req.params.userId, req.body, req.payload);
    return res.status(204).end();
  } catch(err) {
    return next(err);
  }

};

const remove = async (req, res, next) => {
  
  try {
    await userService.remove(req.params.userId, req.payload);
    return res.status(204).end();
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
