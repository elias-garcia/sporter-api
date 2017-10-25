const moment = require('moment');
const appConfig = require('../../config/app.config');
const EventStatus = require('./event-status.enum');
const Event = require('./event.model');
const User = require('../user/user.model');
const Sport = require('../sport/sport.model');
const ApiError = require('../api-error');

const create = async (userId, sportId, name, latitude, longitude,
  startDate, endingDate, description, intensity, fee) => {
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
    startDate: moment(startDate).utc().format(),
    endingDate: moment(endingDate).utc().format(),
    description,
    intensity,
    fee,
    status: EventStatus.WAITING,
    host: userId,
  });

  /* Store the user in the event players field */
  event.players.push(user.id);
  event.save();

  /* Populate the sport, host and player */
  await event.populate('sport').populate('host').populate('players').execPopulate();

  /**
   * Return the created event
   */
  return event;
};

const findAll = async (userId, sportId, startDate,
  latitude, longitude, maxDistance, pageSize, pageNumber) => {
  const limit = pageSize || appConfig.defaultLimit;
  const offset = pageNumber || 1;
  const skip = limit * (offset - 1);
  let query;

  /**
   * Filter the events by user
   */
  if (userId) {
    query = Event.find({ host: userId });
  } else {
    query = Event.find({});
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
    const date = moment(startDate).utc();
    query.where('startDate').gte(date.startOf('day').format()).lte(date.endOf('day').format());
  }

  /**
   * Filter the events by proximity.
   * If maxDistance is not specified it will query by the default maxDistance.
   */
  if (latitude && longitude) {
    const distance = maxDistance || appConfig.defaultMaxDistance;
    query = query.where('location').near({
      center: { coordinates: [longitude, latitude], type: 'Point' }, maxDistance: distance * 1000, spherical: true,
    });
  }

  /**
   * Find the events matching the query params
   */
  const events = await query
    .populate('sport')
    .populate('host')
    .populate('players')
    .sort({ startDate: 'asc' })
    .skip(skip)
    .limit(limit)
    .exec();

  /**
   * Return the matched events
   */
  return events;
};

const find = async (eventId) => {
  /**
   * Find the event in the db
   */
  const event = await Event.findById(eventId)
    .populate('sport')
    .populate('host')
    .populate('players')
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
  startDate, endingDate, description, intensity, fee, status) => {
  /**
   * Find the event and update it
   */
  let event = await Event.findByIdAndUpdate(
    eventId,
    {
      name,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      sport: sportId,
      startDate: moment(startDate).utc().format(),
      endingDate: moment(endingDate).utc().format(),
      description,
      intensity,
      fee,
    },
    { new: true },
  );

  /**
   * Check if the found event exist
   */
  if (!event) {
    throw new ApiError(404, 'event not found');
  }

  /**
   * Populate the event
   */
  event = await event.populate('sport').populate('host').populate('players').execPopulate();

  /**
   * Return the updated event populated
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
