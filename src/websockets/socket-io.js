let io = require('socket.io');
const notificationsSocket = require('./notifications.socket');
const chatSocket = require('./chat.socket');

const configure = (http) => {
  io = io(http);

  const notificationsNamespace = io.of('/notifications');
  const chatNamespace = io.of('/chat');

  notificationsSocket.initHandlers(notificationsNamespace);
  chatSocket.initHandlers(chatNamespace);
};

module.exports = {
  configure,
};
