const mongoose = require('mongoose');
const notificationType = require('./notification-type.enum');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  type: {
    type: String,
    enum: Object.keys(notificationType).map(key => notificationType[key]),
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  url: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
