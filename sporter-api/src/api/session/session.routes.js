const router = require('express').Router();
const sessionController = require('../session/session.controller');

router.all('/', sessionController.session);

module.exports = router;