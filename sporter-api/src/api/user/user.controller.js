const User = require('../user/user.model');

const register = (req, res, next) => {
  User.save(req.body).then(user => {
    const token = jwt.sign({
        sub: user.userId,
      }, appConfig.jwtSecret, {
        expiresIn: appConfig.jwtMaxAge
      });  
      res.status(200).send({
        token
      });
  }).catch(err => {
    next(err);
  });
};

module.exports = {
  register
};
