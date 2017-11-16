const PasswordResetToken = require('../api/password-reset-token/password-reset-token.model');

const expireToken = ('password reset token', async (job) => {
  const dbToken = await PasswordResetToken.findById(job.attrs.data.tokenId);

  await dbToken.remove();
});

module.exports = {
  expireToken,
};

