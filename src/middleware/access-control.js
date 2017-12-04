const accessControl = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');

  return next();
};

module.exports = accessControl;
