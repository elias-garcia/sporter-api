module.exports = {
  port: process.env.PORT || 3000,
  mongo: process.env.MONGO_URI || 'mongodb://localhost:27017/sporter-app',
  path: '/api',
  jwtSecret: 'sporter-jwt-secret',
  jwtMaxAge: '604800', // One week
  aesSecret: 'sporter-aes-secret',
  defaultLimit: 10,
};
