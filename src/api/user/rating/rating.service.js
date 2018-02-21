const appConfig = require('../../../config/app.config');
const Rating = require('./rating.model');

const create = async (fromUserId, toUserId, score, comment) => {
  const rating = await Rating.create({
    from: fromUserId,
    to: toUserId,
    score,
    comment: {
      version: 0,
      value: comment,
    },
  });

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

const update = async (ratingId, score, comment) => {
  const oldRating = await Rating.findById(ratingId);
  const latestValue = oldRating.comment[oldRating.comment.length - 1];

  oldRating.comment.push({
    version: latestValue.version + 1,
    comment,
  });

  const newRating = await oldRating.save();

  return newRating;
};

const remove = async (ratingId) => {
  const rating = Rating.findById(ratingId);

  await rating.remove();
};

module.exports = {
  create,
  findAll,
  update,
  remove,
};
