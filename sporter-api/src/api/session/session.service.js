const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const appConfig = require('./../../config/app.config');
const User = require('../user/user.model');
const ApiError = require('../api-error');

/**
 * Log in the specified user into the application
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * @returns {Object} Session object containing the logged in user userId and a JWT token
 */
const logIn = async (email, password) => {
  /**
   * Check if the user exists in the db
   */
  const user = await User.findOne({ email }).exec();
  if (!user) {
    throw new ApiError(401, 'email does not exist');
  }

  /**
  * Check if the password is valid
  */
  if (!bcrypt.compareSync(password, user.password)) {
    throw new ApiError(401, 'password does not match');
  }

  /**
   * Sign a JWT token
   */
  const token = jwt.sign(
    { sub: user._id },
    appConfig.jwtSecret,
    { expiresIn: appConfig.jwtMaxAge }
  );

  return { _id: user._id, token };
};

module.exports = {
  logIn,
};
