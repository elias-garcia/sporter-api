const messageService = require('../api/event/message/message.service');
const messageDto = require('../api/event/message/message.dto');

const initHandlers = (nsp) => {
  nsp.on('connection', (socket) => {
    socket.join(socket.handshake.query.eventId);

    socket.on('new-message', async (req) => {
      let message = await messageService.create(req.userId, req.eventId, req.message);

      message = messageDto.toMessageDto(message);
      socket.to(req.eventId).emit('message', message);
      socket.emit('message', message);
    });
  });
};

module.exports = {
  initHandlers,
};
