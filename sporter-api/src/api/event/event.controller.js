const appConfig = require('../../config/app.config');
const Event = require('./event.model');
const User = require('../user/user.model');
const Sport = require('../sport/sport.model');
const rest = require('../../util/rest');
const http = require('../../util/http');
const date = require('../../util/date');
const ApiError = require('../api-error');

const create = (req, res, next) => {
  Promise.all([
    Sport.findById(req.body.sportId),
    User.findById(req.body.userId)
  ]).then(values => {
    if (!values[0]) {
      throw new ApiError(404, 'sport not found');
    }
    if (!values[1]) {
      throw new ApiError(404, 'user not found');
    }
    const event = req.body;
    delete event.sport_id;
    event[sport] = values[0];
    event[host] = values[1];
    return Event.create(event);
  }).then(event => {
    return http.sendData('event', event);
  }).catch(err => {
    return next(err);
  });
};

// TODO: PAGINATION
const findAll = (req, res, next) => {
  const limit = req.params.limit || appConfig.defaultLimit;
  const offset = req.params.offset || 1;
  const skip = limit * (offset - 1);
  let query;

  if (req.params.location) {
    query = Event.find({ 'location': { $regex : '/' + req.params.location + '/i' } }, '-__v');
  } else {
    query = Event.find({ }, '-__v');
  }

  if (req.params.sport) {
    query.where('sport._id').equals(req.params.sport);
  }

  if (req.params.date) {
    query.where('start_date').gt(date.startDate(req.params.date)).lt(date.endDate(req.params.date));
  }

  query.sort().skip(skip).limit(limit).exec().then(events => {
    return http.sendData('events', events);
  }).catch(err => {
    return next(err);
  });
};

const find = (req, res, next) => {
  Event.findById(req.eventId, '-__v').exec().then(event => {
    if (!event) {
      throw new ApiError(404, 'event not found');
    }
    return http.sendData('event', event);
  }).catch(err => {
    return next(err);
  });
};

const update = (req, res, next) => {
  Event.findById(req.params.eventId).exec().then(event => {
    if (!event) {
      throw new ApiError(404, 'event not found');
    }
    return event.update(req.body);
  }).then(event => {
    return http.sendEmpty();
  }).catch(err => {
    return next(err);
  });
};

const join = (req, res, next) => {
  Promise.all([
    Event.findById(req.params.eventId),
    Sport.findById(req.body.sportId),
    User.findById(req.body.userId),
  ]).then(values => {
    if (!values[0]) {
      throw new ApiError(404, 'event not found');
    }
    if (!values[1]) {
      throw new ApiError(404, 'sport not found');
    }
    if (!values[2]) {
      return http.sendError(404, 'user not found');
    }
    event.players.push(values[2]);
    return http.sendData('event', event);
  }).catch(err => {
    return next(err);
  });
};

const remove = (req, res, next) => {
  Event.findById(req.params.eventId).exec().then(event => {
    if (!event) {
      throw new ApiError(404, 'event not found');
    }
    return event.remove();
  }).then(event => {
    return http.sendEmpty();
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
    get: find,
    put: update,
    patch: join,
    delete: remove
  });
};

module.exports = {
  events,
  event
};
