const appConfig = require('../../../config/app.config');
const Rating = require('./rating.model');
const User = require('../user.model');
const ApiError = require('../../api-error');

const create = async (fromUserId, toUserId, score, comment) => {
  const toUser = User.findById(toUserId);

  if (!toUser) {
    throw ApiError(404, 'user not found');
  }

  const rating = await Rating.create({
    from: fromUserId,
    to: toUserId,
    score,
    comment: {
      version: 0,
      value: comment,
    },
  });

  await rating.populate('from').execPopulate();

  return rating;
};

const findAll = async (userId, score, pageSize, pageNumber) => {
  const limit = pageSize || appConfig.defaultLimit;
  const offset = pageNumber || 1;
  const skip = limit * (offset - 1);
  const query = Rating.find({ to: userId });

  if (score) {
    query.where('score').equals(score);
  }

  const ratings = await query
    .populate('from')
    .skip(skip)
    .limit(limit);

  return ratings;
};

const update = async (fromUserId, toUserId, ratingId, score, comment) => {
  const toUser = await User.findById(toUserId);
  const oldRating = await Rating.findById(ratingId);

  if (!toUser) {
    throw new ApiError(404, 'user not found');
  }

  if (!oldRating) {
    throw new ApiError(404, 'rating not found');
  }

  if (fromUserId !== oldRating.from.toString()) {
    throw new ApiError(403, 'you are not allowed to access this resource');
  }

  const latestValue = oldRating.comment[oldRating.comment.length - 1];

  oldRating.score = score;
  oldRating.comment.push({
    version: latestValue.version + 1,
    value: comment,
  });

  const newRating = await oldRating.save();

  return newRating.populate('from').execPopulate();
};

const remove = async (fromUserId, toUserId, ratingId) => {
  const toUser = await User.findById(toUserId);
  const rating = await Rating.findById(ratingId);

  if (!toUser) {
    throw new ApiError(404, 'user not found');
  }

  if (!rating) {
    throw new ApiError(404, 'rating not found');
  }

  if (fromUserId !== rating.from.toString()) {
    throw new ApiError(403, 'you are not allowed to access this resource');
  }

  await rating.remove();
};

module.exports = {
  create,
  findAll,
  update,
  remove,
};