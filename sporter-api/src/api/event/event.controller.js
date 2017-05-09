const appConfig = require('../../config/app.config');
const Event = require('./event.model');
const User = require('../user/user.model');
const Sport = require('../sport/sport.model');
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
    return Event.create(req.body);
  }).then(event => {
    return http.sendData(res, 'event', event);
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

  if (req.params.user_id) {
    query.where('host').equals(req.params.user_id);
  }

  if (req.params.sport) {
    query.where('sport').equals(req.params.sport_id);
  }

  if (req.params.date) {
    query.where('start_date').gt(date.startDate(req.params.start_date));
  }

  query.sort().skip(skip).limit(limit).exec().then(events => {
    console.log(events);
    return http.sendData(res, 'events', events);
  }).catch(err => {
    return next(err);
  });
};

const find = (req, res, next) => {
  Event.findById(req.eventId, '-__v').populate('sport', 'host', 'players').exec().then(event => {
    if (!event) {
      throw new ApiError(404, 'event not found');
    }
    return http.sendData(res, 'event', event);
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
    return http.sendEmpty(res);
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
      throw new ApiError(404, 'user not found');
    }
    values[0].players.push(req.body);
    return http.sendData(res, 'event', event);
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
    return http.sendEmpty(res);
  }).catch(err => {
    return next(err);
  });
};

module.exports = {
  findAll,
  create,
  find,
  update,
  join,
  remove
};
