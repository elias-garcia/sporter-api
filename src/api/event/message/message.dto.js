const dto = require('../../../util/dto');
const userDto = require('../../user/user.dto');

const toMessageDto = (doc) => {
  const ret = dto.transform(doc);

  ret.user = userDto.toUserDto(doc.user);

  return ret;
};

const toMessagesDto = docs => docs.map(doc => toMessageDto(doc));

module.exports = {
  toMessageDto,
  toMessagesDto,
};
