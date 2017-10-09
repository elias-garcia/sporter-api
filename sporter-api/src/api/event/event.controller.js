const EventIntensity = require('./event-intensity.enum');
const eventService = require('./event.service');
const validator = require('../../util/validator');
const json = require('../../util/json');
const ApiError = require('../api-error');
const dto = require('../../util/dto');

const create = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (!validator.isMongoId(req.body.sportId) ||
      !validator.isString(req.body.name) ||
      !validator.isLatLongArray(req.body.coordinates) ||
      !validator.isDateAfterNow(req.body.startDate) ||
      !validator.isDateAfterNow(req.body.endingDate) ||
      !validator.isDateAfter(req.body.endingDate, req.body.startDate) ||
      !validator.isString(req.body.description) ||
      !Object.values(EventIntensity).includes(req.body.intensity) ||
      !validator.isBoolean(req.body.paid)
    ) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Create the event
     */
    const event = await eventService.create(
      req.claim.sub,
      req.body.sportId,
      req.body.name,
      req.body.coordinates[0],
      req.body.coordinates[1],
      new Date(req.body.startDate),
      new Date(req.body.endingDate),
      req.body.description,
      req.body.intensity,
      req.body.paid,
    );

    /**
     * Return the created event
     */
    return res.status(200).json(json.createData('event', dto.transform(event)));
  } catch (err) {
    return next(err);
  }
};

const findAll = async (req, res, next) => {
  let startDate;
  let latitude;
  let longitude;

  try {
    /**
     * Validate the input data
     */
    if (req.query.userId) {
      if (!validator.isMongoId(req.query.userId)) {
        throw new ApiError(422, 'unprocessable entity');
      }
    }

    if (req.query.sportId) {
      if (!validator.isMongoId(req.query.sportId)) {
        throw new ApiError(422, 'unprocessable entity');
      }
    }

    if (req.query.startDate) {
      if (!validator.isISO8601(req.query.startDate)) {
        throw new ApiError(422, 'unprocessable entity');
      }
      /**
       * Convert the string to a valid JS Date
       */
      startDate = new Date(req.query.startDate);
    }

    if (req.query.coordinates) {
      if (!validator.isLatLong(req.query.coordinates)) {
        throw new ApiError(422, 'unprocessable entity');
      }
      /**
       * Split the validated coordinates
       */
      latitude = Number(req.query.coordinates.split(',')[0]);
      longitude = Number(req.query.coordinates.split(',')[1]);
    }

    if (req.query.maxDistance) {
      if (!validator.isInt(req.query.maxDistance)) {
        throw new ApiError(422, 'unprocessable entity');
      }
    }

    if (req.query.limit) {
      if (!validator.isInt(req.query.limit)) {
        throw new ApiError(422, 'unprocessable entity');
      }
    }

    if (req.query.offset) {
      if (!validator.isInt(req.query.limit)) {
        throw new ApiError(422, 'unprocessable entity');
      }
    }

    /**
     * Find the events matching the criteria
     */
    const events = await eventService.findAll(
      req.query.userId,
      req.query.sportId,
      startDate,
      latitude,
      longitude,
      req.query.maxDistance,
      Number(req.query.limit),
      Number(req.query.offset),
    );

    /**
     * Return the matching events
     */
    return res.status(200).json(json.createData('events', dto.transform(events)));
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

    /**
     * Find the requested event
     */
    const event = await eventService.find(req.params.eventId);

    /**
     * Return the requested event
     */
    return res.status(200).json(json.createData('event', dto.transform(event)));
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (!validator.isMongoId(req.body.sportId) ||
      !validator.isString(req.body.name) ||
      !validator.isLatLongArray(req.body.coordinates) ||
      !validator.isDateAfterNow(req.body.startDate) ||
      !validator.isDateAfterNow(req.body.endingDate) ||
      !validator.isDateAfter(req.body.endingDate, req.body.startDate) ||
      !validator.isString(req.body.description) ||
      !Object.values(EventIntensity).includes(req.body.intensity) ||
      !validator.isBoolean(req.body.paid)
    ) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Update the event
     */
    await eventService.update(
      req.params.eventId,
      req.body.sportId,
      req.body.name,
      req.body.coordinates[0],
      req.body.coordinates[1],
      new Date(req.body.startDate),
      new Date(req.body.endingDate),
      req.body.description,
      req.body.intensity,
      req.body.paid,
      req.body.status,
    );

    /**
     * Return no content
     */
    return res.status(204).end();
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
     * Join the user to the event
     */
    await eventService.join(
      req.claim.sub,
      req.body.eventId,
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
    await eventService.remove(req.claim.sub, req.params.eventId);

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
  remove,
};
