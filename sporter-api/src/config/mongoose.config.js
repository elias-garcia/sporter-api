const mongoose = require('mongoose');
const appConfig = require('../config/app.config');

const configure = () => {
  mongoose.Promise = global.Promise;

  mongoose.connect(appConfig.mongo, { useMongoClient: true }, () => {
    // Initialization code
    // mongoose.set('debug', true);
  });

  mongoose.connection.on('connected', () => {
    console.log(`Mongoose default connection open to ${appConfig.mongo}`);
  });

  mongoose.connection.on('error', (err) => {
    console.log(`Mongoose default connection error ${err}`);
  });

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('Mongoose default connection disconnected through app termination');
      process.exit(0);
    });
  });
};

module.exports = configure;
