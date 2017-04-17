const appConfig = require('./app.config');
const expressConfig = require('./express.config');
const mongooseConfig = require('./mongoose.config');

module.exports = {
  app: appConfig,
  express: expressConfig,
  mongoose: mongooseConfig
};
