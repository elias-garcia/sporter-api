const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const appConfig = require('../../config/app.config');
const User = require('../user/user.model');
const ApiError = require('../api-error');

/**
 * Registers a new user into the application and log he in.
 * @param {*} email - Email of the new user
 * @param {*} password - Password of the new user
 * @param {*} first_name - First name of the new user
 * @param {*} last_name - Lasr name of the new user
 * @param {*} age - Age of the new user
 * @param {*} location - Location of the new user
 * @returns {Object} Session object containing the logged in user userId and a JWT token
 */
const register = async (email, password, first_name, last_name, age, location) => {
  /**
   * Check if the user already exists in the db
   */
  const oldUser = await User.findOne({ email }).exec();
  if (oldUser) {
    throw new ApiError(409, 'user already exists');
  }

  /**
   * Create the user in the db
   */
  const newUser = await User.create({
    email, password, first_name, last_name, age, location,
  });

  /**
   * Sign a JWT token
   */
  const token = jwt.sign(
    { sub: newUser._id },
    appConfig.jwtSecret,
    { expiresIn: appConfig.jwtMaxAge },
  );

  return { _id: newUser._id, token };
};

/**
 * Finds the specified user in db
 * @param {*} userId - The userId of the user to be found
 * @returns {Object} User object containing the user information
 */
const findById = async (userId) => {
  /**
   * Find the user in db and check if it exists
   */
  const user = await User.findById(userId, '-password -__v').exec();
  if (!user) {
    throw new ApiError(404, 'user not found');
  }

  return user;
};

/**
 * Updates the specified user information
 * @param {*} userId - The userId of the user to be updated
 * @param {*} email - The new email of the user
 * @param {*} password - The new password of the user
 * @param {*} first_name - The new first name of the user
 * @param {*} last_name - The new last name of the user
 * @param {*} age - The new age of the user
 * @param {*} location - The new location of the user
 */
const update = async (userId, email, first_name, last_name, age, location) => {
  /**
   * Check if the user exists in the database
   */
  const user = await User.findById(userId).exec();
  if (!user) {
    throw new ApiError(404, 'user not found');
  }

  /**
   * Update the user information
   */
  await user.update({
    email, first_name, last_name, age, location,
  });
};

/**
 * Updates only the user password
 * @param {*} userId - The userId of the user to be updated
 * @param {*} oldPassword - The current password of the user
 * @param {*} email - The new password of the user
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  /**
   * Find the user to be updated to check if it exists
   */
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'user not found');
  }

  /**
   * Check if the old password sent by the user is correct
   */
  if (!bcrypt.compareSync(oldPassword, user.password)) {
    throw new ApiError(422, 'unprocessable entity');
  }

  /**
   * Update the user password
   */
  await user.update({ password: newPassword });
};

/**
 * Removes the specified user from db
 * @param {*} userId - The userId of the user to be removed
 */
const remove = async (userId) => {
  /**
   * Find the user to be removed to check if it exists
   */
  const user = await User.findById(userId).exec();
  if (!user) {
    throw new ApiError(404, 'user not found');
  }

  /**
   * Remove the user
   */
  await user.remove();
};

module.exports = {
  register,
  findById,
  update,
  changePassword,
  remove,
};
