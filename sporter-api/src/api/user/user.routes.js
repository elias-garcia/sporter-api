const router = require('express').Router();
const userController = require('./user.controller');

router.post('/', userController.register);

router.get('/:id', userController.find);

module.exports = router;
