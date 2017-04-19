const crypto = require('crypto');
const appConfig = require('../config/app.config');

const algorithm = 'aes-256-ctr';

const encrypt = (text) => {
  var cipher = crypto.createCipher(algorithm, appConfig.aesSecret);
  var crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
};
 
const decrypt = (text) => {
  var decipher = crypto.createDecipher(algorithm, appConfig.aesSecret);
  var dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
};

module.exports = {
  encrypt,
  decrypt
};
