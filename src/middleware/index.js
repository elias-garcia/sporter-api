const auth = require('./auth');
const contentType = require('./content-type');
const accessControl = require('./access-control');

module.exports = {
  auth,
  acceptJson: contentType.acceptJson,
  setJson: contentType.setJson,
  accessControl,
};
