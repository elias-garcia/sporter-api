const mongoose = require('mongoose');

module.exports = (config) => {

  mongoose.connect(config.mongo);

  mongoose.connection.on('connected', () => {
    console.log(`Mongoose default connection open to ${config.mongo}`);
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