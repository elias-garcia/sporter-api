const eventIntensity = require('./event-intensity.enum');
const eventCurrencyCode = require('./event-currency-code.enum');
const eventStatus = require('./event-status.enum');
const eventService = require('./event.service');
const validator = require('../../util/validator');
const json = require('../../util/json');
const eventDto = require('./event.dto');
const ApiError = require('../api-error');

const create = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (!validator.isMongoId(req.body.sport) ||
      !validator.isString(req.body.name) ||
      !validator.isLatLongArray(req.body.location) ||
      !validator.isISO8601(req.body.startDate) ||
      !validator.isDateAfterNow(req.body.startDate) ||
      !validator.isISO8601(req.body.endingDate) ||
      !validator.isDateAfter(req.body.endingDate, req.body.startDate) ||
      !validator.isString(req.body.description) ||
      !Object.values(eventIntensity).includes(req.body.intensity.toUpperCase()) ||
      !validator.isGreaterIntThan(req.body.maxPlayers, 2) ||
      !validator.isGreaterFloatThan(req.body.fee, 0) ||
      !Object.values(eventCurrencyCode).includes(req.body.currencyCode.toUpperCase())
    ) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Create the event
     */
    const event = await eventService.create(
      req.user.sub,
      req.body.sport,
      req.body.name,
      req.body.location[0],
      req.body.location[1],
      req.body.startDate,
      req.body.endingDate,
      req.body.description,
      req.body.intensity.toUpperCase(),
      req.body.maxPlayers,
      req.body.fee,
      req.body.currencyCode,
    );

    /**
     * Return the created event
     */
    return res.status(201).json(json.createData([{ title: 'event', data: eventDto.toEventDto(event) }]));
  } catch (err) {
    return next(err);
  }
};

const findAll = async (req, res, next) => {
  let limit;
  let offset;
  let maxDistance;
  let status;
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
    }

    if (req.query.location) {
      if (!validator.isLatLong(req.query.location)) {
        throw new ApiError(422, 'unprocessable entity');
      }
      /**
       * Split the validated coordinates
       */
      latitude = Number(req.query.location.split(',')[0]);
      longitude = Number(req.query.location.split(',')[1]);
    }

    if (req.query.maxDistance) {
      if (!validator.isGreaterFloatThan(Number(req.query.maxDistance), 0.1)) {
        throw new ApiError(422, 'unprocessable entity');
      }
      maxDistance = Number(req.query.maxDistance);
    }

    if (req.query.status) {
      if (!Object.values(eventStatus).includes(req.query.status.toUpperCase())) {
        throw new ApiError(422, 'unprocessable entity');
      }
      status = req.query.status.toUpperCase();
    }

    if (req.query.history) {
      if (!validator.isBoolean(req.query.history)) {
        throw new ApiError(422, 'unprocessable entity');
      }
    }

    if (req.query.limit) {
      if (!validator.isGreaterIntThan(Number(req.query.limit), 1)) {
        throw new ApiError(422, 'unprocessable entity');
      }
      limit = Number(req.query.limit);
    }

    if (req.query.offset) {
      if (!validator.isGreaterIntThan(Number(req.query.offset), 1)) {
        throw new ApiError(422, 'unprocessable entity');
      }
      offset = Number(req.query.offset);
    }

    /**
     * Find the events matching the criteria
     */
    const events = await eventService.findAll(
      req.query.userId,
      req.query.sportId,
      req.query.startDate,
      latitude,
      longitude,
      maxDistance,
      status,
      Boolean(req.query.history),
      limit,
      offset,
    );

    /**
     * Return the matching events
     */
    return res.status(200).json(json.createData([{ title: 'events', data: eventDto.toEventsDto(events) }]));
  } catch (err) {
    return next(err);
  }
};

const find = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (!validator.isMongoId(req.params.eventId)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Find the requested event
     */
    const event = await eventService.find(req.params.eventId);

    /**
     * Return the requested event
     */
    return res.status(200).json(json.createData([{ title: 'event', data: eventDto.toEventDto(event) }]));
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (!validator.isMongoId(req.body.sport) ||
      !validator.isString(req.body.name) ||
      !validator.isLatLongArray(req.body.location) ||
      !validator.isISO8601(req.body.startDate) ||
      !validator.isDateAfterNow(req.body.startDate) ||
      !validator.isISO8601(req.body.endingDate) ||
      !validator.isDateAfter(req.body.endingDate, req.body.startDate) ||
      !validator.isString(req.body.description) ||
      !Object.values(eventIntensity).includes(req.body.intensity.toUpperCase()) ||
      !validator.isGreaterIntThan(req.body.maxPlayers, 2) ||
      !validator.isGreaterFloatThan(req.body.fee, 0) ||
      !Object.values(eventCurrencyCode).includes(req.body.currencyCode.toUpperCase())
    ) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Update the event
     */
    const event = await eventService.update(
      req.user.sub,
      req.params.eventId,
      req.body.sport,
      req.body.name,
      req.body.location[0],
      req.body.location[1],
      req.body.startDate,
      req.body.endingDate,
      req.body.description,
      req.body.intensity.toUpperCase(),
      req.body.maxPlayers,
      req.body.fee,
      req.body.currencyCode,
    );

    /**
     * Return the updated event
     */
    return res.status(200).send(json.createData([{ title: 'event', data: eventDto.toEventDto(event) }]));
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (!validator.isMongoId(req.params.eventId)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Remove the event from db
     */
    await eventService.remove(req.user.sub, req.params.eventId);

    /**
     * Return no content
     */
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  create,
  find,
  findAll,
  update,
  remove,
};
