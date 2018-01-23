const mongoose = require('mongoose');
const appConfig = require('../config/app.config');
// const dbProd = require('../scripts/db-prod');

const configure = async () => {
  mongoose.Promise = global.Promise;

  mongoose.connection.on('connected', () => {
    // dbProd.init();
    console.log(`Mongoose default connection open to ${appConfig.mongo}`);
  });

  mongoose.connection.on('error', (err) => {
    console.log(`Mongoose default connection error ${err}`);
  });

  await mongoose.connect(appConfig.mongo, { useMongoClient: true });

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('Mongoose default connection disconnected through app termination');
      process.exit(0);
    });
  });
};

module.exports = configure;
