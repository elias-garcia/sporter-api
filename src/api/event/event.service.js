const moment = require('moment');
const appConfig = require('../../config/app.config');
const EventStatus = require('./event-status.enum');
const Event = require('./event.model');
const User = require('../user/user.model');
const Sport = require('../sport/sport.model');
const scheduler = require('../../util/scheduler');
const jobTypes = require('../../jobs/job-types.enum');
const ApiError = require('../api-error');

const create = async (userId, sportId, name, latitude, longitude,
  startDate, endingDate, description, intensity, maxPlayers, fee, currencyCode) => {
  /**
   * Check if the user exists in the db
   */
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'user not found');
  }

  /**
 * Check if the sport exists in the db
 */
  const sport = await Sport.findById(sportId);
  if (!sport) {
    throw new ApiError(404, 'sport not found');
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
    maxPlayers,
    fee,
    currencyCode,
    status: EventStatus.WAITING,
    host: userId,
  });

  /* Store the user in the event players field */
  event.players.push(user.id);
  event.save();

  /* Populate the sport, host and player */
  await event.populate('sport').populate('host').execPopulate();

  /**
   * Schedule tasks for the event to change it's status based on
   * it's dates
   */
  scheduler.schedule(
    moment(startDate).subtract(30, 'minutes').utc().toDate(),
    jobTypes.EVENT_CONFIRM,
    { eventId: event.id },
  );

  scheduler.schedule(
    moment(startDate).utc().toDate(),
    jobTypes.EVENT_START,
    { eventId: event.id },
  );

  scheduler.schedule(
    moment(endingDate).utc().toDate(),
    jobTypes.EVENT_FINISH,
    { eventId: event.id },
  );

  /**
   * Return the created event
   */
  return event;
};

const findAll = async (userId, sportId, startDate, latitude,
  longitude, maxDistance, status, pageSize, pageNumber) => {
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
    query.where('location').near({
      center: { coordinates: [longitude, latitude], type: 'Point' }, maxDistance: distance * 1000, spherical: true,
    });
  }

  /**
   * Filter the events by status
   */
  if (status) {
    query.where('status').equals(status);
  }

  /**
   * Find the events matching the query params
   */
  const events = await query
    .populate('sport')
    .populate('host')
    .sort({ startDate: 'asc' })
    .skip(skip)
    .limit(limit);

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
    .populate('host');

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

const update = async (userId, eventId, sportId, name, latitude, longitude,
  startDate, endingDate, description, intensity, maxPlayers, fee, currencyCode) => {
  let event = await Event.findById(eventId);

  /**
   * Check if the found event exist
   */
  if (!event) {
    throw new ApiError(404, 'event not found');
  }

  /**
   * Check if the event to be removed was created by the user who performs the request
   */
  if (userId !== event.host.toString()) {
    throw new ApiError(403, 'you are not allowed to access this resource');
  }

  /**
   * Check if the event can be updated
   */
  if (!(event.status === EventStatus.WAITING &&
    event.players.length === 1 &&
    event.players[0].toString() === userId)) {
    throw new ApiError(409, 'event can\'t be updated');
  }

  /**
   * Update the event
   */
  event.name = name;
  event.location = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
  event.sport = sportId;
  event.startDate = moment(startDate).utc().format();
  event.endingDate = moment(endingDate).utc().format();
  event.description = description;
  event.intensity = intensity;
  event.maxPlayers = maxPlayers;
  event.fee = fee;
  event.currencyCode = currencyCode;

  /**
   * Save the event
   */
  event = await event.save();

  /**
   * Populate the event
   */
  event = await event.populate('sport').populate('host').execPopulate();

  /**
   * Return the updated event
   */
  return event;
};

const remove = async (userId, eventId) => {
  const event = await Event.findById(eventId);

  /**
   * Check if the event exists
   */
  if (!event) {
    throw new ApiError(404, 'event not found');
  }

  /**
   * Check if the event to be removed was created by the user who performs the request
   */
  if (userId !== event.host.toString()) {
    throw new ApiError(403, 'you are not allowed to access this resource');
  }

  /**
   * Check if the event can be removed
   */
  if (!(event.status === EventStatus.WAITING &&
    event.players.length === 1 &&
    event.players[0].toString() === userId)) {
    throw new ApiError(409, 'event can\'t be removed');
  }

  /**
   * Remove the event from db
   */
  await event.remove();

  /**
   * Remove the scheduled tasks for the event
   */
  scheduler.cancel({ 'data.eventId': eventId }, () => { });
};

module.exports = {
  create,
  findAll,
  find,
  update,
  remove,
};
