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
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(403, 'email not found');
  }

  /**
  * Check if the password is valid
  */
  if (!bcrypt.compareSync(password, user.password)) {
    throw new ApiError(403, 'password does not match');
  }

  /**
   * Sign a JWT token
   */
  const token = jwt.sign(
    { sub: user.id },
    appConfig.jwtSecret,
    { expiresIn: appConfig.jwtMaxAge },
  );

  return { userId: user.id, firstName: user.firstName, token };
};

module.exports = {
  logIn,
};
