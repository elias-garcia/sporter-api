const router = require('express').Router();
const ratingController = require('./rating.controller');

router.get('/:userId/ratings', ratingController.findAll);
router.post('/:userId/ratings', ratingController.create);

router.put('/:userId/ratings/:ratingId', ratingController.update);
router.delete('/:userId/ratings/:ratingId', ratingController.remove);

module.exports = router;
