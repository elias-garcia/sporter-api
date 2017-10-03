const mongoose = require('mongoose');
const dbScript = require('../scripts/db-prod');
const appConfig = require('../config/app.config');

const configure = () => {
  mongoose.Promise = global.Promise;

  mongoose.connect(appConfig.mongo, { useMongoClient: true }, () => {
    mongoose.connection.db.dropDatabase();
    dbScript.init();
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
