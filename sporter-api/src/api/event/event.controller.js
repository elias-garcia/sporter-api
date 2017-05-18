const appConfig = require('../../config/app.config');
const Event = require('./event.model');
const User = require('../user/user.model');
const Sport = require('../sport/sport.model');
const json = require('../../util/json');
const date = require('../../util/date');
const ApiError = require('../api-error');

const create = async (req, res, next) => {

  try {
    const sport = await Sport.findById(req.body.sportId);
    if (!sport) {
      throw new ApiError(404, 'sport not found');
    }
    const user = await User.findById(req.body.userId);
    if (!user) {
      throw new ApiError(404, 'user not found');
    }
    const event = await Event.create(req.body);
    return http.sendData(res, 'event', event);
  } catch(err) {
    return next(err);
  }

};

const findAll = async (req, res, next) => {
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

  try {
    const events = await query.sort().skip(skip).limit(limit).exec();
    return http.sendData(res, 'events', events);
  } catch (err) {
    return next(err);
  }

};

const find = async (req, res, next) => {
  
  try {
    const event = await Event.findById(req.eventId, '-__v').populate('sport', 'host', 'players').exec(); 
    if (!event) {
      throw new ApiError(404, 'event not found');
    }
    return http.sendData(res, 'event', event);
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
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      throw new ApiError(404, 'event not found');
    }
    const sport = await Sport.findById(req.body.sportId);
    if (!sport) {
      throw new ApiError(404, 'sport not found');
    }
    const user = await User.findById(req.body.userId);
    if (!user) {
      throw new ApiError(404, 'user not found');
    }
    // values[0].players.push(req.body);
    return http.sendData(res, 'event', event);
  } catch (err) {
    return next(err);
  }

};

const remove = async (req, res, next) => {

  try {
    const event = await Event.findById(req.params.eventId).exec();
    if (!event) {
      throw new ApiError(404, 'event not found');
    }
    await event.remove();
    return http.sendEmpty(res);
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
