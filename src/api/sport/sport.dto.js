const dto = require('../../util/dto');

const toSportDto = doc => dto.transform(doc);

const toSportsDto = docs => docs.map(doc => toSportDto(doc));

module.exports = {
  toSportDto,
  toSportsDto,
};
