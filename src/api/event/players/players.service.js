const eventStatus = require('../event-status.enum');
const Event = require('..//event.model');
const User = require('../../user/user.model');
const ApiError = require('../../api-error');
const io = require('../../../websockets/socket-io');
const notificationService = require('../../notification/notification.service');
const notificationType = require('../../notification/notification-type.enum');

const join = async (userId, eventId) => {
  /**
   * Check if the user exists
   */
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'user not found');
  }

  /**
   * Check if the event exists
   */
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, 'event not found');
  }

  /**
   * Check if the event is in WAITING status
   */
  if (event.status !== eventStatus.WAITING) {
    throw new ApiError(409, 'event does not accept new players');
  }

  /**
   * Check if the user already takes part in the event
   */
  if (event.players.map(playerId => String(playerId)).includes(userId)) {
    throw new ApiError(409, 'you\'ve already joined the event');
  }

  /**
   * Notify the users
   */
  const notificationUrl = `events/${event.id}`;
  event.players.forEach(async (playerId) => {
    await notificationService.create(playerId, notificationType.JOIN_EVENT, notificationUrl);
    io.emitNewNotifications(playerId);
  });

  /**
   * Add the user to the event players list
   */
  event.players.push(user.id);

  /**
   * Check if the event is full and change its status and notify the users
   */
  if (event.players.length === event.maxPlayers) {
    event.status = eventStatus.FULL;
    event.players.forEach(async (player) => {
      await notificationService.create(player.id, notificationType.EVENT_FULL, notificationUrl);
      io.emitNewNotifications(player.id);
    });
  }
  /**
   * Save changes
   */
  await event.save();

  /**
   * Return the player added to the event
   */
  return user;
};

const findAll = async (eventId) => {
  /**
   * Check if the event exists
   */
  let event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, 'event not found');
  }

  /**
   * Populate the players
   */
  event = await event.populate('players').execPopulate();

  /**
   * Return the players
   */
  return event.players;
};

const leave = async (userId, eventId) => {
  /**
   * Check if the user exists
   */
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'user not found');
  }

  /**
   * Check if the event exists
   */
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, 'event not found');
  }

  /**
   * Check if the user can leave the event
   */
  if (event.status !== eventStatus.WAITING && event.status !== eventStatus.FULL) {
    throw new ApiError(409, 'you can\'t leave the event');
  }

  /**
   * Check if the user takes part in the event
   */
  if (!event.players.map(playerId => String(playerId)).includes(userId)) {
    throw new ApiError(404, 'user not found in the event');
  }

  /**
   * Remove the user from the event players
   */
  event.players = event.players.filter(playerId => String(playerId) !== userId);

  /**
   * Check if the event was FULL and its status needs to be changed
   */
  if (event.status === eventStatus.FULL && event.players.length === (event.maxPlayers - 1)) {
    event.status = eventStatus.WAITING;
  }

  /**
   * Save changes
   */
  return event.save();
};

module.exports = {
  join,
  findAll,
  leave,
};
