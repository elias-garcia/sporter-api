const authenticate = require('./authenticate');
const contentType = require('./content-type');

module.exports = {
  authenticate,
  acceptJson: contentType.acceptJson,
  setJson: contentType.setJson
};
