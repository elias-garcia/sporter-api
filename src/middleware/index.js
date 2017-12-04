const auth = require('./auth');
const contentType = require('./content-type');
const accessControl = require('./access-control');
const methodAllowed = require('./method-allowed');

module.exports = {
  auth,
  acceptJson: contentType.acceptJson,
  setJson: contentType.setJson,
  accessControl,
  methodAllowed,
};
