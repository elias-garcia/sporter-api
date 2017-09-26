const authenticate = require('./auth');
const contentType = require('./content-type');

module.exports = {
  authenticate,
  acceptJson: contentType.acceptJson,
  setJson: contentType.setJson
};
