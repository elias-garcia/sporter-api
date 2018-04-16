const dto = require('../../util/dto');
const userDto = require('../user/user.dto');

const toEventDto = (doc) => {
  const ret = dto.transform(doc);
  console.log(ret);
  ret.location = [doc.location.coordinates[1], doc.location.coordinates[0]];
  ret.sport = dto.transform(doc.sport);
  ret.host = userDto.toUserDto(doc.host);
  delete ret.players;

  return ret;
};

const toEventsDto = docs => docs.map(doc => toEventDto(doc));

module.exports = {
  toEventDto,
  toEventsDto,
};
