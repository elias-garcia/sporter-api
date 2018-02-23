const validator = require('../../../util/validator');
const ApiError = require('../../api-error');
const ratingService = require('./rating.service');
const ratingDto = require('./rating.dto');
const json = require('../../../util/json');

const create = async (req, res, next) => {
  try {
    if (!req.params.userId
      || !validator.isMongoId(req.params.userId)
      || !req.body.score
      || !validator.isSmallerIntThan(req.body.score, 5)
      || !req.body.comment
      || !validator.isString(req.body.comment)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    const rating = await ratingService.create(
      req.user.sub,
      req.params.userId,
      req.body.score,
      req.body.comment,
    );

    return res.status(201).json(json.createData('rating', ratingDto.toRatingDto(rating)));
  } catch (err) {
    return next(err);
  }
};

const findAll = async (req, res, next) => {
  let score;
  let limit;
  let offset;

  try {
    if (!validator.isMongoId(req.params.userId)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    if (req.query.score) {
      if (!validator.isSmallerIntThan(Number(req.query.score), 5)) {
        throw new ApiError(422, 'unprocessable entity');
      }
      score = Number(req.query.score);
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

    const ratings = await ratingService.findAll(req.params.userId, score, limit, offset);

    return res.status(200).json(json.createData('ratings', ratingDto.toRatingsDto(ratings)));
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    if (!req.params.userId
      || !validator.isMongoId(req.params.userId)
      || !req.params.ratingId
      || !validator.isMongoId(req.params.ratingId)
      || !req.body.score
      || !validator.isSmallerIntThan(req.body.score, 5)
      || !req.body.comment
      || !validator.isString(req.body.comment)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    const rating = await ratingService.update(
      req.user.sub,
      req.params.userId,
      req.params.ratingId,
      req.body.score,
      req.body.comment,
    );

    return res.status(200).send(json.createData('rating', ratingDto.toRatingDto(rating)));
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    if (!req.params.userId
      || !validator.isMongoId(req.params.userId)
      || !req.params.ratingId
      || !validator.isMongoId(req.params.ratingId)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    await ratingService.remove(req.user.sub, req.params.userId, req.params.ratingId);

    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  create,
  findAll,
  update,
  remove,
};
