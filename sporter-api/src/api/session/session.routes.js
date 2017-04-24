const router = require('express').Router();
const sessionController = require('../session/session.controller');

router.post('/', sessionController.session);

module.exports = router;