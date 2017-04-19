const router = require('express').Router();
const sessionService = require('../session/session.service');

router.post('/', sessionService.logIn(req, res));

module.exports = router;