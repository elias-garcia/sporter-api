const sendData = (res, title, data) => {
  const content = {
    data: {}
  };

  content.data[title] = data;
  
  return res.status(200).json(content);
};

const sendError = (res, status, message, handlers) => {
  const content = {
    error: {
      status,
      message
    }
  };

  if (status === 405) {
    res.set('Allow', Object.keys(handlers).join(', ').toUpperCase());
  }

  return res.status(status).json(content);
};

const sendEmpty = (res) => {
  return res.status(204).end();
};

module.exports = {
  sendData,
  sendError,
  sendEmpty
};
