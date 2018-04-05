const Message = require('./message.model');

const create = async (userId, eventId, text) => {
  const message = await Message.create({
    user: userId,
    event: eventId,
    message: text,
  });

  await message.populate('user').execPopulate();

  return message;
};

const findAll = async (eventId) => {
  const messages = await Message.find({ event: eventId }).sort({ createdAt: 'asc' }).populate('user');

  return messages;
};

module.exports = {
  create,
  findAll,
};

