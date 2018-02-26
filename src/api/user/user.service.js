const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const appConfig = require('../../config/app.config');
const User = require('../user/user.model');
const PasswordResetToken = require('../password-reset-token/password-reset-token.model');
const scheduler = require('../../util/scheduler');
const ApiError = require('../api-error');

/**
 * Registers a new user into the application and log he in.
 * @param {*} email - Email of the new user
 * @param {*} password - Password of the new user
 * @param {*} firstName - First name of the new user
 * @param {*} lastName - Lasr name of the new user
 * @param {*} birthdate - Birthdate of the new user
 * @returns {Object} Session object containing the logged in user userId and a JWT token
 */
const register = async (email, password, passwordConfirm, firstName, lastName, birthdate) => {
  /**
   * Check if the user already exists in the db
   */
  const oldUser = await User.findOne({ email });
  if (oldUser) {
    throw new ApiError(409, 'user already exists');
  }

  /**
   * Create the user in the db
   */
  const newUser = await User.create({
    email,
    password,
    firstName,
    lastName,
    birthdate: moment.utc(birthdate).toDate(),
  });

  /**
   * Sign a JWT token
   */
  const token = jwt.sign(
    { sub: newUser.id },
    appConfig.jwtSecret,
    { expiresIn: appConfig.jwtMaxAge },
  );

  return { userId: newUser.id, firstName: newUser.firstName, token };
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
  const user = await User.findById(userId, '-password');
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
 * @param {*} firstName - The new first name of the user
 * @param {*} lastName - The new last name of the user
 * @param {*} birthdate - The birthdate of the user
 * @param {*} location - The new location of the user
 */
const update = async (userId, email, firstName, lastName, birthdate, location) => {
  /**
   * Find and update the user information
   */
  const user = await User.findByIdAndUpdate(
    userId,
    {
      email,
      firstName,
      lastName,
      birthdate,
      location,
    },
    { new: true },
  );

  /**
   * Check if the user to update exists
   */
  if (!user) {
    throw new ApiError(404, 'user not found');
  }

  /**
   * Return the updated user
   */
  return user;
};

/**
 * Updates only the user password
 * @param {*} userId - The userId of the user to be updated
 * @param {*} oldPassword - The current password of the user
 * @param {*} email - The new password of the user
 * @param {*} token - A reset password token
 */
const changePassword = async (userId, oldPassword, newPassword, token) => {
  /**
   * Find the user to be updated to check if it exists
   */
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'user not found');
  }

  /**
   * If token exists, find the hashed token in db and check if it's valid.
   * If it's valid then cancel the scheduled job and remove the token info from db
   */
  if (token) {
    const dbToken = await PasswordResetToken.findOne({ user: userId });

    if (!bcrypt.compareSync(token, dbToken.value)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    await scheduler.cancel({ data: { userId } });
    await dbToken.remove();
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
  user.password = newPassword;

  await user.save();
};

/**
 * Removes the specified user from db
 * @param {*} userId - The userId of the user to be removed
 */
const remove = async (userId) => {
  /**
   * Find the user to be removed to check if it exists
   */
  const user = await User.findById(userId);
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
