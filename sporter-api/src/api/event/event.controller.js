const validator = require('validator');
const appConfig = require('../../config/app.config');
const EventStatus = require('./event-status.enum');
const EventIntensity = require('./event-intensity.enum');
const eventService = require('./event.service');
const json = require('../../util/json');
const ApiError = require('../api-error');

const create = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (typeof (req.body.sportId) !== 'string' ||
      !validator.isMongoId(req.body.sportId) ||
      typeof (req.body.name) !== 'string' ||
      typeof (req.body.location) !== 'string' ||
      typeof (req.body.start_date) !== 'string' ||
      !validator.isISO8601(start_date) ||
      typeof (req.body.ending) !== 'string' ||
      !validator.isISO8601(ending_date) ||
      typeof (req.body.description) !== 'string' ||
      !Object.values(EventIntensity.includes(req.body.intensity)) ||
      typeof (req.body.paid) !== 'boolean' ||
      !Object.values(EventStatus).includes(req.body.status)
    ) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Create the event
     */
    const event = await eventService.create(
      req.payload.sub,
      req.body.sportId,
      req.body.name,
      req.body.location,
      req.body.start_date,
      req.body.ending_date,
      req.body.description,
      req.body.intensity,
      req.body.paid,
      req.body.status
    );

    /**
     * Return the created event
     */
    return res.status(200).json(json.createData('event', event));
  } catch (err) {
    return next(err);
  }
};

const findAll = async (req, res, next) => {
  const limit = req.params.limit || appConfig.defaultLimit;
  const offset = req.params.offset || 1;
  const skip = limit * (offset - 1);
  let query;

  if (req.params.location) {
    query = Event.find({ 'location': { $regex: '/' + req.params.location + '/i' } }, '-__v');
  } else {
    query = Event.find({}, '-__v');
  }
  if (req.params.user_id) {
    query.where('host').equals(req.params.user_id);
  }
  if (req.params.sport) {
    query.where('sport').equals(req.params.sport_id);
  }
  if (req.params.date) {
    query.where('start_date').gt(date.startDate(req.params.start_date));
  }

  try {
    const events = await query.sort().skip(skip).limit(limit).exec();
    return http.sendData(res, 'events', events);
  } catch (err) {
    return next(err);
  }

};

const find = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (typeof (req.params.eventId) !== 'string' ||
      !validator.isMongoId(req.params.eventId)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    const event = await eventService.find(req.params.eventId);
    /**
     * Return the requested event
     */
    return res.status(200).json(json.createData('event', event));
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {

  try {
    const event = await Event.findById(req.params.eventId).exec();
    if (!event) {
      throw new ApiError(404, 'event not found');
    }
    await event.update(req.body);
    return http.sendEmpty(res);
  } catch (err) {
    return next(err);
  }

};

const join = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (typeof (req.params.eventId) !== 'string' ||
      !validator.isMongoId(req.params.eventId)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Join the event
     */
    const event = await eventService.join(
      req.payload.sub,
      req.body.eventId
    );

    /**
     * Return no content
     */
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (typeof (req.params.eventId) !== 'string' ||
      !validator.isMongoId(req.params.eventId)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Remove the event from db
     */
    await eventService.remove(req.payload.sub, eventId);

    /**
     * Return no content
     */
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  findAll,
  create,
  find,
  update,
  join,
  remove
};
