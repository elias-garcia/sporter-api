const nodemailer = require('nodemailer');
const appConfig = require('../config/app.config');

const transporter = nodemailer.createTransport(appConfig.mailer);

const sendPasswordResetToken = async (email, token) => {
  try {
    await transporter.sendMail({
      from: 'Sender Name <sender@example.com>',
      to: email,
      subject: 'Sporter App - Reset password',
      text: token,
      html: `<p>${token}</p>`,
    });
  } catch (err) {
    throw (err);
  }
};

module.exports = {
  sendPasswordResetToken,
};
