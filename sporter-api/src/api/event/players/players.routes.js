const router = require('express').Router();
const playersController = require('./players.controller');

router.post('/:eventId/players', playersController.join);
router.get('/:eventId/players', playersController.findAll);
router.delete('/:eventId/players/:playerId', playersController.leave);

module.exports = router;
