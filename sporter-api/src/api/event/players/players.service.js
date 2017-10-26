const EventStatus = require('../event-status.enum');
const Event = require('..//event.model');
const User = require('../../user/user.model');
const ApiError = require('../../api-error');

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
  if (event.status !== EventStatus.WAITING) {
    throw new ApiError(409, 'event does not accept new players');
  }

  /**
   * Check if the event has available space for a new player
   */
  if (event.players.length === event.maxPlayers) {
    throw new ApiError(409, 'event is full');
  }

  /**
   * Add the user to the event players list
   */
  event.players.push(user.id);

  /**
   * Check if the event is full and change its status
   */
  if (event.players.length === event.maxPlayers) {
    event.status = EventStatus.FULL;
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
    throw new ApiError(404, 'event doest not exist');
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
  if (event.status !== EventStatus.WAITING && event.status !== EventStatus.FULL) {
    throw new ApiError(409, 'you can\'t leave the event');
  }

  /**
   * Remove the user from the event players
   */
  event.players.filter(playerId => playerId.toString() !== userId);

  /**
   * Check if the event was FULL and its status needs to be changed
   */
  if (event.status === EventStatus.FULL && event.players.length < event.maxPlayers) {
    event.status = EventStatus.WAITING;
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
