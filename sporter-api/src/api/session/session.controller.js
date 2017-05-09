const User = require('../user/user.model');
const userService = require('../user/user.service');
const http = require('../../util/http');

const logIn = async (req, res, next) => {

  try {
    const session = await userService.logIn(req.body.email, req.body.password);
    
    http.sendData(res, 'session', session);
  } catch (err) {
    next(err);
  }

};

module.exports = {
  logIn
};
