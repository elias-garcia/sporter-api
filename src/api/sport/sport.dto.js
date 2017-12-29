const dto = require('../../util/dto');

const toSportDto = (doc) => {
  const ret = dto.transform(doc);

  delete ret.createdAt;
  delete ret.updatedAt;

  return ret;
};

const toSportsDto = docs => docs.map(doc => toSportDto(doc));

module.exports = {
  toSportDto,
  toSportsDto,
};
