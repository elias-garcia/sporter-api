const Event = require('./event.model');
const rest = require('../../util/rest');
const http = require('../../util/http');
const appConfig = require('../../config/app.config');
const date = require('../../util/date');

const create = (req, res, next) => {
  Event.findOne(req.body.eventId).then(event => {
    if (event) {
      return res.status(409).json(http.createError(409, 'event already exists'));
    }
    return Event.create(req.body);
  }).then(event => {
    return res.status(200).json(http.createData('event', event));
  }).catch(err => {
    next(err);
  });
};

// TODO: PAGINATION
const findAll = (req, res, next) => {
  const limit = req.params.limit || appConfig.defaultLimit;
  const offset = req.params.offset || 1;
  const skip = limit * (offset - 1);
  let query;

  if (req.params.location) {
    query = Event.find({ 'location': { $regex : '/' + req.params.location + '/i' } });
  } else {
    query = Event.find();
  }

  if (req.params.sport) {
    query.where('sport._id').equals(req.params.sport);
  }

  if (req.params.date) {
    query.where('').gt(date.startDate(req.params.date)).lt(date.endDate(req.params.date));
  }

  query.sort().skip(skip).limit(limit).exec().then(events => {
    return res.status(200).json(http.createData('events', events));
  }).catch(err => {
    return next(err);
  });
};

const find = (req, res, next) => {
  Event.findById(req.eventId, '-__v').exec().then(event => {
    if (event) {
      return res.status(200).json(http.createData('event', event));
    }
    return res.status(404).json(http.createError(404, 'event not found'));
  }).catch(err => {
    return next(err);
  });
};

const events = (req, res, next) => {
  rest.restful(req, res, next, {
    get: findAll,
    post: create
  });
};

const event = (req, res, next) => {
  rest.restful(req, res, next, {
    get: find
  });
};

module.exports = {
  events,
  event
};
