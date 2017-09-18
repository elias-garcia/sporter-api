const appConfig = require('../../config/app.config');
const Event = require('./event.model');
const User = require('../user/user.model');
const Sport = require('../sport/sport.model');
const json = require('../../util/json');
const date = require('../../util/date');
const ApiError = require('../api-error');

const create = async (userId, sportId, name, location, start_date, ending_date, description, intensity, paid, status) => {
  /**
   * Check if the sport exists in the db
   */
  const sport = await Sport.findById(sportId);
  if (!sport) {
    throw new ApiError(404, 'sport not found');
  }

  /**
   * Check if the user exists in the db
   */
  const user = await User.findById(req.body.userId);
  if (!user) {
    throw new ApiError(404, 'user not found');
  }

  /**
   * Create the event
   */
  const event = await Event.create({
    name,
    location,
    sport,
    start_date,
    ending_date,
    description,
    intensity,
    paid,
    status,
    host: user,
    players: [user._id]
  });

  /**
   * Return the created event
   */
  return event;
};

const find = async (eventId) => {
  /**
   * Find the event in the db
   */
  const event = await Event.findById(eventId, '-__v')
    .populate('sport', 'host', 'players')
    .exec();

  /**
   * Check if the event exists
   */
  if (!event) {
    throw new ApiError(404, 'event not found');
  }

  /**
   * Return the found event
   */
  return event;
};

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
   * Add the user to the event players list
   */
  event.players.push(user._id);

  /**
   * Save changes
   */
  await event.save();

  /**
   * Return the event
   */
  return event;
};

const remove = async (userId, eventId) => {
  /**
   * Check if the event exists
   */
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, 'event not found');
  }

  /**
   * Check if the event to be removed was created by the user who performs the request
   */
  if (userId !== event.host) {
    throw new ApiError(403, 'you are not allowed to access this resource');
  }

  /**
   * Remove the event from db
   */
  event.remove();

  /**
   * Return the event
   */
  return event;
}

module.exports = {
  create,
  find,
  join,
  remove
}
