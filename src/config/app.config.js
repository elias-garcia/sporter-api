module.exports = {
  port: process.env.PORT || 3000,
  mongo: process.env.MONGO_URI || 'mongodb://localhost:27017/sporter-app',
  path: '/api',
  jwtSecret: process.env.JWT_SECRET || 'sporter-jwt-secret',
  jwtMaxAge: '604800', // One week in seconds
  passwordResetTokenExpiration: 3600, // One hour in seconds
  defaultLimit: 10,
  defaultMaxDistance: 10,
  mailer: {
    host: process.env.MAILER_HOST || 'smtp.ethereal.email',
    port: process.env.MAILER_PORT || 587,
    auth: {
      user: process.env.MAILER_USER || 'u2alwcia7b7pfqwo@ethereal.email',
      pass: process.env.MAILER_PASSWORD || 'wWkb5USA53FM6KK6v9',
    },
  },
  sentryDsn: process.env.SENTRY_DSN || '',
};
