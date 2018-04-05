const validator = require('../../../util/validator');
const messageService = require('./message.service');
const json = require('../../../util/json');
const messageDto = require('./message.dto');
const ApiError = require('../../api-error');

const findAll = async (req, res, next) => {
  try {
    if (!req.params.eventId
      || !validator.isMongoId(req.params.eventId)) {
      throw new ApiError(422, 'unprocessable entity');
    }

    const messages = await messageService.findAll(req.params.eventId);
    console.log(messages);
    return res.status(200).send(json.createData([{ title: 'messages', data: messageDto.toMessagesDto(messages) }]));
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  findAll,
};

