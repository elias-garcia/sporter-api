const dto = require('../../../util/dto');

const toRatingDto = (doc) => {
  const ret = dto.transform(doc);

  delete ret.createdAt;
  delete ret.updatedAt;

  return ret;
};

const toRatingsDto = docs => docs.map(doc => toRatingDto(doc));

module.exports = {
  toRatingDto,
  toRatingsDto,
};

