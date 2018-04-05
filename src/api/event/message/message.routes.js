const router = require('express').Router();
const messageController = require('./message.controller');

router.get('/:eventId/messages', messageController.findAll);

module.exports = router;
