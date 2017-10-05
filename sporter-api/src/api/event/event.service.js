const appConfig = require('../../config/app.config');
const EventStatus = require('./event-status.enum');
const Event = require('./event.model');
const User = require('../user/user.model');
const Sport = require('../sport/sport.model');
const date = require('../../util/date');
const ApiError = require('../api-error');

const MILE_TO_KM = 1.60934;

const create = async (userId, sportId, name, latitude, longitude,
  startDate, endingDate, description, intensity, paid) => {
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
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'user not found');
  }

  /**
   * Create the event
   */
  const event = await Event.create({
    name,
    location: {
      coordinates: [longitude, latitude],
    },
    sport: sportId,
    start_date: startDate,
    ending_date: endingDate,
    description,
    intensity,
    paid,
    status: EventStatus.WAITING,
    host: userId,
    players: [user.id],
  });

  /**
   * Return the created event
   */
  return event;
};

const findAll = async (userId, sportId, startDate,
  latitude, longitude, maxDistance, total, page) => {
  const limit = total || appConfig.defaultLimit;
  const offset = page || 1;
  const skip = limit * (offset - 1);
  let query;

  /**
   * Filter the events by user
   */
  if (userId) {
    query = Event.find({ host: userId }, '-__v');
  } else {
    query = Event.find({}, '-__v');
  }

  /**
   * Filter the events by sport
   */
  if (sportId) {
    query.where('sport').equals(sportId);
  }

  /**
   * Filter the events by day
   */
  if (startDate) {
    query.where('start_date').gte(date.startDate(startDate)).lte(date.endDate(startDate));
  }

  /**
   * Filter the events by proximity.
   * If maxDistance is not specified it will query by the default maxDistance.
   */
  if (latitude && longitude) {
    const distance = maxDistance || appConfig.defaultMaxDistance;

    query = query.where('location').near({
      center: [longitude, latitude], maxDistance: distance * MILE_TO_KM, spherical: true,
    });
  }

  /**
   * Find the events matching the query params
   */
  const events = await query.skip(skip).limit(limit).exec();

  /**
   * Return the matched events
   */
  return events;
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

const update = async (eventId, sportId, name, latitude, longitude,
  startDate, endingDate, description, intensity, paid, status) => {
  /**
   * Check if the event exists
   */
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, 'event not found');
  }

  await event.update({
    name,
    location: {
      coordinates: [longitude, latitude],
    },
    sport: sportId,
    start_date: startDate,
    ending_date: endingDate,
    description,
    intensity,
    paid,
    status,
  });

  /**
   * Return the updated event
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
  event.players.push(user.id);

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
};

module.exports = {
  create,
  findAll,
  find,
  update,
  join,
  remove,
};
