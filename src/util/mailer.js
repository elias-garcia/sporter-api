const nodemailer = require('nodemailer');
const appConfig = require('../config/app.config');

const transporter = nodemailer.createTransport(appConfig.mailer);

const sendPasswordResetToken = async (email, userId, token) => {
  try {
    await transporter.sendMail({
      from: 'Sender Name <sender@example.com>',
      to: email,
      subject: 'Sporter App - Reset password',
      text: `Please, visit ${appConfig.clientUrl}/forgot-password/${userId}-${token} to reset your password`,
      html: `<p>Please, <a href="${appConfig.clientUrl}/forgot-password/reset/${userId}-${token}" target="_blank">click here</a> to reset your password</p>`,
    });
  } catch (err) {
    throw (err);
  }
};

module.exports = {
  sendPasswordResetToken,
};
