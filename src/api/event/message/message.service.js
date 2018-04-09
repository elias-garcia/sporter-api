/* eslint arrow-body-style: ["error", "always"] */
const Message = require('./message.model');
const Event = require('../event.model');
const notificationService = require('../../notification/notification.service');
const notificationType = require('../../notification/notification-type.enum');
const notificationsSocket = require('../../../websockets/notifications.socket');

const create = async (userId, eventId, text) => {
  const message = await Message.create({
    user: userId,
    event: eventId,
    message: text,
  });

  const event = await Event.findById(eventId);

  await Promise.all(event.players.map(async (playerId) => {
    if (playerId.toString() !== userId) {
      const notifications = await notificationService.findAll(playerId);
      const isUserAlreadyNotified = notifications.some((notification) => {
        return notification.type === notificationType.NEW_MESSAGE && !notification.read;
      });

      if (!isUserAlreadyNotified) {
        const url = `events/${eventId}`;

        await notificationService.create(playerId, notificationType.NEW_MESSAGE, url);
        notificationsSocket.emitNewNotifications(playerId);
      }
    }
  }));

  await message.populate('user').execPopulate();

  return message;
};

const findAll = async (eventId) => {
  const messages = await Message.find({ event: eventId }).sort({ createdAt: 'asc' }).populate('user');

  return messages;
};

module.exports = {
  create,
  findAll,
};

