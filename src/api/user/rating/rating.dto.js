/* eslint no-underscore-dangle: 0 */
/* eslint no-param-reassign: 0 */
const dto = require('../../../util/dto');
const userDto = require('../user.dto');

const toRatingDto = (doc) => {
  const ret = dto.transform(doc);

  delete ret.createdAt;
  delete ret.updatedAt;
  ret.from = userDto.toUserDto(ret.from);

  ret.comment.forEach((comment) => {
    delete comment._id;
  });

  return ret;
};

const toRatingsDto = docs => docs.map(doc => toRatingDto(doc));

module.exports = {
  toRatingDto,
  toRatingsDto,
};

