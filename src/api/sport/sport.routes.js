const router = require('express').Router();
const sportController = require('./sport.controller');

router.get('/', sportController.findAll);

module.exports = router;
