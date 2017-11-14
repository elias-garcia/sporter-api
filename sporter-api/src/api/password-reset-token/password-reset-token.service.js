const crypto = require('crypto');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const appConfig = require('../../config/app.config');
const User = require('../user/user.model');
const PasswordResetToken = require('./password-reset-token.model');
const mailer = require('../../util/mailer');
const scheduler = require('../../util/scheduler');
const ApiError = require('../api-error');

const createPasswordResetToken = async (email) => {
  /**
   * Check if the user exists
   */
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'user not found');
  }

  /**
   * If the user has already been issued with a token,
   * the old is deleted and another one is issued
   */
  const oldToken = await PasswordResetToken.findOne({ user: user.id });
  if (oldToken) {
    oldToken.remove();
  }

  /**
   * Generate the new token
   */
  const newToken = crypto.randomBytes(32).toString('hex');
  const issueDate = moment().utc();
  const expirationDate = issueDate.clone();

  expirationDate.add(appConfig.passwordResetTokenExpiration, 'seconds');

  /**
   * Hash the token and store it in the db with the issueDate and expirationDate
   */
  const token = await PasswordResetToken.create({
    value: bcrypt.hashSync(newToken, 10),
    issueDate: issueDate.format(),
    expirationDate: expirationDate.format(),
    user: user.id,
  });

  scheduler.define('password reset token', async (job) => {
    const dbToken = await PasswordResetToken.findById(job.attrs.data.tokenId);

    await dbToken.remove();
  });

  scheduler.schedule(expirationDate.toDate(), 'password reset token', { tokenId: token.id, userId: user.id });

  /**
   * Send the password reset link to te user by email
   */
  await mailer.sendPasswordResetToken(user.email, user.id, newToken);
};

module.exports = {
  createPasswordResetToken,
};
