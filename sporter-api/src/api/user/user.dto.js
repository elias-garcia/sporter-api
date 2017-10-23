const dto = require('../../util/dto');

const toUserDto = (doc) => {
  const ret = dto.transform(doc);

  if (ret.password) {
    delete ret.password;
  }

  return ret;
};

const toUsersDto = docs => docs.map(doc => toUserDto(doc));

module.exports = {
  toUserDto,
  toUsersDto,
};
