const Notification = require('./notification.model');
const appConfig = require('../../config/app.config');

const create = async (userId, type, url) => {
  const notification = {
    userId,
    type,
    url,
  };
  return Notification.create(notification);
};

const countUnreadNotifications = async (userId) => {
  const count = await Notification.count({ userId, read: false });

  return count;
};

const findAll = async (userId, offset) => {
  const skip = appConfig.defaultNotificationsLimit * (offset - 1);
  console.log(skip);
  const notifications = await Notification
    .find({ userId })
    .sort({ createdAt: 'desc' })
    .skip(skip)
    .limit(appConfig.defaultNotificationsLimit);

  return notifications;
};

const markAsRead = async (notificationId) => {
  const notification = await Notification.findById(notificationId);

  notification.read = true;
  await notification.save();

  return notification;
};

module.exports = {
  create,
  countUnreadNotifications,
  findAll,
  markAsRead,
};

