const validator = require('../../util/validator');
const ApiError = require('../api-error');
const passwordResetTokenService = require('./password-reset-token.service');

const createPasswordResetToken = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (!req.body.email ||
      !validator.isEmail(req.body.email)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Issue the token and send it to the user
     */
    await passwordResetTokenService.createPasswordResetToken(req.body.email);

    return res.status(202).end();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createPasswordResetToken,
};
