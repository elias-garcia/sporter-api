const router = require('express').Router();
const userController = require('./user.controller');

router.all('/', userController.users);

router.all('/:userId', userController.user);

module.exports = router;
