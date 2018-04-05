const router = require('express').Router();
const playerController = require('./player.controller');

router.post('/:eventId/players', playerController.join);
router.get('/:eventId/players', playerController.findAll);
router.delete('/:eventId/players/:playerId', playerController.leave);

module.exports = router;
