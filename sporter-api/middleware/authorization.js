const jwt = require('jsonwebtoken');
const appConfig = require('./../config/app.config');

const authorize = (req, res, next) => {

  const auth = req.get('Authorization');

  if (auth) {
    const token = auth.split(' ')[1];
    try {
      jwt.verify(token, appConfig.jwt);
      return next();
    } catch (err) {
      res.status(401).send();
    }
  }

  res.status(401).send();

};

module.exports = {
  authorize: authorize
};
