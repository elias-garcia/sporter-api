module.exports = {
  port: process.env.PORT || 3000,
  mongo: process.env.MONGO_URI || 'mongodb://localhost:27017/sporter-app'
};