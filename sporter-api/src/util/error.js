const handle404 = (req, res, next) => {
  console.log(err);
  res.status(404).send();
};

const handle500 = (err, req, res, next) => {
  console.log(err);
  res.status(500).send(err);
};

module.exports = {
  handle404,
  handle500
};
