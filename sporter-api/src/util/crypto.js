const crypto = require('crypto');
const appConfig = require('../config/app.config');

const algorithm = 'aes-256-ctr';

const encrypt = (text) => {

  try {
    const cipher = crypto.createCipher(algorithm, appConfig.aesSecret);
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  } catch (err) {
    throw(err);
  }

};
 
const decrypt = (text) => {
  
  try {
    const decipher = crypto.createDecipher(algorithm, appConfig.aesSecret);
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  } catch(err) {
    throw(err);
  }
  
};

module.exports = {
  encrypt,
  decrypt
};
