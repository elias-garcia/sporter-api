module.exports = {
  port: process.env.PORT || 3000,
  mongo: process.env.MONGO_URI || 'mongodb://localhost:27017/sporter-app',
  path: '/api',
  jwtSecret: process.env.JWT_SECRET || 'sporter-jwt-secret',
  jwtMaxAge: '7d', // One week
  passwordResetTokenExpiration: 3600, // One hour in seconds
  defaultLimit: 10,
  defaultMaxDistance: 10,
  mailer: {
    host: process.env.MAILER_HOST || 'smtp.ethereal.email',
    port: process.env.MAILER_PORT || 587,
    auth: {
      user: process.env.MAILER_USER || 'uhhkfpgsq2kpoti2@ethereal.email',
      pass: process.env.MAILER_PASSWORD || 'V8VbPRhQfZFrPfjCrf',
    },
  },
  sentryDsn: process.env.SENTRY_DSN || '',
};
