const moment = require('moment');
const dto = require('../../util/dto');

const toUserDto = (doc) => {
  const ret = dto.transform(doc);

  if (ret.password) {
    delete ret.password;
  }

  ret.birthdate = moment.utc(ret.birthdate).format('YYYY-MM-DD');

  return ret;
};

const toUsersDto = docs => docs.map(doc => toUserDto(doc));

module.exports = {
  toUserDto,
  toUsersDto,
};
