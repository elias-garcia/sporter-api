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
  const count = await Notification.count({ userId });

  return count;
};

const findAll = async (userId, skip) => {
  const notifications = await Notification
    .find({ userId })
    .skip(skip)
    .limit(appConfig.defaultLimit)
    .sort({ createdAt: 'asc' });

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

