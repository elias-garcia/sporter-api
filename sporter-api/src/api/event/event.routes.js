const router = require('express').Router();
const eventController = require('./event.controller');

router.get('/', eventController.findAll);
router.post('/', eventController.create);

router.get('/:eventId', eventController.find);
router.put('/:eventId', eventController.update);
router.delete('/:eventId', eventController.remove);

module.exports = router;
