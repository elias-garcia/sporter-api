const router = require('express').Router();

router.post('/', userController.register(req, res, next));

module.exports = router;
