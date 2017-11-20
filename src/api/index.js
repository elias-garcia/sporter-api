const router = require('express').Router();
const sessionRoutes = require('./session/session.routes');
const userRoutes = require('./user/user.routes');
const sportRoutes = require('./sport/sport.routes');
const eventRoutes = require('./event/event.routes');
const playerRoutes = require('./event/players/players.routes');
const passwordResetTokenRoutes = require('./password-reset-token/password-reset-token.routes');

router.use('/sessions', sessionRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/events', playerRoutes);
router.use('/sports', sportRoutes);
router.use('/password-reset-token', passwordResetTokenRoutes);

module.exports = router;
