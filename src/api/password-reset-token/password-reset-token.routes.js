const router = require('express').Router();
const passwordResetTokenController = require('./password-reset-token.controller');

router.post('/', passwordResetTokenController.createPasswordResetToken);

module.exports = router;
