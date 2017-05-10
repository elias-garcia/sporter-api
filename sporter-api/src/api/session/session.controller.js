const User = require('../user/user.model');
const userService = require('../user/user.service');
const json = require('../../util/json');

const logIn = async (req, res, next) => {

  try {
    const session = await userService.logIn(req.body.email, req.body.password);
    return res.status(200).json(json.createData('session', session));
  } catch (err) {
    return next(err);
  }

};

module.exports = {
  logIn
};
