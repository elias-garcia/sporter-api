const playersService = require('./players.service');
const validator = require('../../../util/validator');
const json = require('../../../util/json');
const userDto = require('../../user/user.dto');
const ApiError = require('../../api-error');

const join = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (!validator.isMongoId(req.params.eventId)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Join the user to the event
    */
    const player = await playersService.join(req.user.sub, req.params.eventId);

    /**
     * Return the updated event
     */
    return res.status(201).send(json.createData('player', userDto.toUserDto(player)));
  } catch (err) {
    return next(err);
  }
};

const findAll = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (!validator.isMongoId(req.params.eventId)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Find the event players
     */
    const players = await playersService.findAll(req.params.eventId);

    /**
     * Return the players
     */
    return res.status(200).send(json.createData('players', userDto.toUsersDto(players)));
  } catch (e) {
    return next(e);
  }
};

const leave = async (req, res, next) => {
  try {
    /**
     * Validate the input data
     */
    if (!validator.isMongoId(req.params.eventId) ||
      !validator.isMongoId(req.params.playerId)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    /**
     * Check if the playerId is the same as the user who sent the request
     */
    if (req.user.sub !== req.params.playerId) {
      throw new ApiError(403, 'you are not allowed to access this resource');
    }

    /**
     * Remove the user from the event
     */
    await playersService.leave(req.user.sub, req.params.eventId);

    /**
     * Return the updated event
     */
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  join,
  findAll,
  leave,
};
