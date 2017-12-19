const userService = require('./user.service');
const json = require('../../util/json');
const validator = require('../../util/validator');
const ApiError = require('../api-error');
const userDto = require('./user.dto');

const create = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (!validator.isEmail(req.body.email) ||
      !req.body.password ||
      !req.body.passwordConfirm ||
      !(req.body.password === req.body.passwordConfirm) ||
      !validator.isString(req.body.firstName) ||
      !validator.isString(req.body.lastName) ||
      !validator.isISO8601Date(req.body.birthdate)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Register and log in the user in the application
     */
    const session = await userService.register(
      req.body.email,
      String(req.body.password),
      String(req.body.passwordConfirm),
      req.body.firstName,
      req.body.lastName,
      req.body.birthdate,
    );

    /**
     * Return the session object
     */
    return res.status(201).json(json.createData('session', session));
  } catch (err) {
    return next(err);
  }
};

const find = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (!validator.isMongoId(req.params.userId)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Retrieve the user information from db
     */
    const user = await userService.findById(req.params.userId);

    /**
     * Return the created user object
     */
    return res.status(200).json(json.createData('user', userDto.toUserDto(user)));
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (!validator.isMongoId(req.params.userId) ||
      !validator.isEmail(req.body.email) ||
      !validator.isString(req.body.firstName) ||
      !validator.isString(req.body.lastName) ||
      !validator.isISO8601Date(req.body.birthdate) ||
      !validator.isString(req.body.location)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Check if the user to be updated is the same who performs the request
     */
    if (req.user.sub !== req.params.userId) {
      throw new ApiError(403, 'you are not allowed to access this resource');
    }

    /**
     * Update the user information
     */
    const user = await userService.update(
      req.params.userId,
      req.body.email,
      req.body.firstName,
      req.body.lastName,
      req.body.birthdate,
      req.body.location,
    );

    /**
     * Return no content
     */
    return res.status(200).json(json.createData('user', userDto.toUserDto(user)));
  } catch (err) {
    return next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (!validator.isMongoId(req.params.userId) ||
      !req.body.old_password ||
      !req.body.new_password ||
      !req.body.new_password_repeat ||
      String(req.body.new_password) !== String(req.body.new_password_repeat)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Check if the user to be updated is the same who performs the request
     */
    if (req.user.sub !== req.params.userId) {
      throw new ApiError(403, 'you are not allowed to access this resource');
    }

    /**
     * Try to update the user password
     */
    await userService.changePassword(
      req.params.userId,
      String(req.body.old_password),
      String(req.body.new_password),
      req.body.token,
    );

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
    if (!validator.isMongoId(req.params.userId)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Check if the user to be removed is the same who performs the request
     */
    if (req.user.sub !== req.params.userId) {
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
  changePassword,
  remove,
};
