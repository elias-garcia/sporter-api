const validator = require('../../util/validator');
const sessionService = require('./session.service');
const ApiError = require('../api-error');
const json = require('../../util/json');

const logIn = async (req, res, next) => {
  try {
    /**
     * Validate the body params
     */
    if (!validator.isEmail(req.body.email)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Log in the user into the application
     */
    const session = await sessionService.logIn(
      req.body.email,
      String(req.body.password),
    );

    /**
     * Return the session object
     */
    return res.status(200).json(json.createData([{ title: 'session', data: session }]));
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  logIn,
};
