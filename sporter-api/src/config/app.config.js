module.exports = {
  port: process.env.PORT || 3000,
  mongo: process.env.MONGO_URI || 'mongodb://localhost:27017/sporter-app',
  path: '/api',
  jwtSecret: 'sporter-jwt-secret',
  jwtMaxAge: '604800', // One week in seconds
  passwordResetTokenExpiration: 3600, // One hour in seconds
  defaultLimit: 10,
  defaultMaxDistance: 10,
  mailer: {
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'u2alwcia7b7pfqwo@ethereal.email',
      pass: 'wWkb5USA53FM6KK6v9',
    },
  },
};
