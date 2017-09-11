const validator = require('validator');
const User = require('../user/user.model');
const userService = require('./user.service');
const json = require('../../util/json');
const ApiError = require('../api-error');

const create = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (typeof (req.body.email) !== 'string' ||
      !validator.isEmail(req.body.email) ||
      !req.body.password ||
      typeof (req.body.first_name) !== 'string' ||
      typeof (req.body.last_name) !== 'string' ||
      typeof (req.body.age) !== 'number' ||
      typeof (req.body.location) !== 'string') {
      throw new ApiError(400, 'bad request');
    }

    /**
     * Register and log in the user in the application
     */
    const session = await userService.register(
      req.body.email,
      String(req.body.password),
      req.body.first_name,
      req.body.last_name,
      req.body.age,
      req.body.location
    );

    /**
     * Return the session object
     */
    return res.status(200).json(json.createData('session', session));
  } catch (err) {
    return next(err);
  }
};

const find = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (typeof (req.params.userId) !== 'string' ||
      !validator.isMongoId(req.params.userId)) {
      throw new ApiError(400, 'bad request');
    }

    /**
     * Retrieve the user information from db
     */
    const user = await userService.findById(req.params.userId);

    /**
     * Return the created user object
     */
    return res.status(200).json(json.createData('user', user));
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (typeof (req.params.userId) !== 'string' ||
      !validator.isMongoId(req.params.userId)
      || typeof (req.body.email) !== 'string' ||
      !validator.isEmail(req.body.email) ||
      !req.body.password ||
      typeof (req.body.first_name) !== 'string' ||
      typeof (req.body.last_name) !== 'string' ||
      typeof (req.body.age) !== 'number' ||
      typeof (req.body.location) !== 'string') {
      throw new ApiError(400, 'bad request');
    }

    /**
     * Check if the user to be updated is the same who performs the request
     */
    if (!req.payload || req.payload.sub !== req.params.userId) {
      throw new ApiError(403, 'you are not allowed to access this resource');
    }

    /**
     * Update the user information
     */
    const user = await userService.update(
      req.params.userId,
      req.body.email,
      String(req.body.password),
      req.body.first_name,
      req.body.last_name,
      req.body.age,
      req.body.location);

    /**
     * Return no content
     */
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (typeof (req.params.userId) !== 'string' ||
      !validator.isMongoId(req.params.userId)) {
      throw new ApiError(400, 'bad request');
    }

    /**
     * Check if the user to be removed is the same who performs the request
     */
    if (!req.payload || req.payload.sub !== req.params.userId) {
      throw new ApiError(403, 'you are not allowed to access this resource');
    }

    /**
     * Remove the user from db
     */
    await userService.remove(req.params.userId);

    /**
     * Return no content
     */
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  create,
  find,
  update,
  remove
};
