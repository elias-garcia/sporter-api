const router = require('express').Router();
const routerController = require('./event.controller');

router.get('/', routerController.findAll);
router.post('/', routerController.create);

router.get('/:eventId', routerController.find);
router.put('/:eventId', routerController.update);
router.patch('/:eventId', routerController.join);
router.delete('/:eventId', routerController.remove);

module.exports = router;
