const router = require('express').Router();
const sessionRoutes = require('./session/session.routes');
const userRoutes = require('./user/user.routes');
const sportRoutes = require('./sport/sport.routes');
const eventRoutes = require('./event/event.routes');

router.use('/sessions', sessionRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/sports', sportRoutes);

module.exports = router;
