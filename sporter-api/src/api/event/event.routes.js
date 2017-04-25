const router = require('express').Router();
const routerController = require('./event.controller');

router.all('/events', routerController.events);

router.all('/event', routerController.event);

module.exports = router;
