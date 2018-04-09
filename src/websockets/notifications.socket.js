const notificationService = require('../api/notification/notification.service');
const dto = require('../util/dto');

let namespace;
let sockets = [];

const findAndTransformNotifications = async (userId, skip) => {
  try {
    const notifications = await notificationService.findAll(userId, skip);

    return notifications.map(notification => dto.transform(notification));
  } catch (err) {
    throw err;
  }
};

const emitNewNotifications = async (userId, socket) => {
  try {
    const notifications = await findAndTransformNotifications(userId, 1);
    const unread = await notificationService.countUnreadNotifications(userId);

    if (socket) {
      socket.emit('new-notifications', { notifications, unread });
    } else {
      const client = sockets.filter(clientElem => clientElem.userId === userId.toString())[0];

      namespace.to(client.socketId).emit('new-notifications', { notifications, unread });
    }
  } catch (err) {
    throw err;
  }
};

const emitNotifications = async (socket, query) => {
  try {
    const notifications = await findAndTransformNotifications(query.userId, query.skip);
    const unread = await notificationService.countUnreadNotifications(query.userId);

    if (socket) {
      socket.emit('notifications', { notifications, unread });
    }
  } catch (err) {
    throw err;
  }
};

const markNotificationAsRead = async (notificationId) => {
  try {
    await notificationService.markAsRead(notificationId);
  } catch (err) {
    throw err;
  }
};

const initHandlers = (nsp) => {
  namespace = nsp;

  namespace.on('connection', (socket) => {
    sockets.push({
      socketId: socket.id,
      userId: socket.handshake.query.userId,
    });

    emitNewNotifications(socket.handshake.query.userId, socket);

    socket.on('read-notification', async (notificationId) => {
      await markNotificationAsRead(notificationId);
    });

    socket.on('query-notifications', async (query) => {
      emitNotifications(socket, query);
    });

    socket.on('disconnect', () => {
      sockets = sockets.filter(client => client.socketId !== socket.id);
    });
  });
};

module.exports = {
  initHandlers,
  emitNewNotifications,
};
