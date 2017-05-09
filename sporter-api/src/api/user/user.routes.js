const router = require('express').Router();
const userController = require('./user.controller');

router.post('/', userController.register);

router.get('/:userId', userController.find);
router.put('/:userId', userController.update);
router.delete('/:userId', userController.remove);

module.exports = router;
