const router = require('express').Router();
const sessionRoutes = require('./session/session.routes');
const userRoutes = require('./user/user.routes');

router.use('/session', sessionRoutes);

router.use('/users', userRoutes);

module.exports = router;
