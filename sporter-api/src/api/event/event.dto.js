const dto = require('../../util/dto');

const toEventDto = (doc) => {
  const ret = dto.transform(doc);

  [ret.location.coordinates[0], ret.location.coordinates[1]] =
    [doc.location.coordinates[1], doc.location.coordinates[0]];
  ret.sport = dto.transform(ret.sport);
  ret.host = dto.transform(ret.host);
  ret.players = ret.players.map(player => dto.transform(player));

  return ret;
};

const toEventsDto = docs => docs.map(doc => toEventDto(doc));

module.exports = {
  toEventDto,
  toEventsDto,
};
