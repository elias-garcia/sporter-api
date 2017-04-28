const sendData = (res, title, data) => {
  const content = {
    data: {}
  };

  content.data[title] = data;

  return res.status(200).json(data);
};

const sendError = (res, status, message, details) => {
  const content = {
    error: {
      status,
      message
    }
  };

  if (details) {
    content.error.details = [];
    details.forEach(() => {
      content.error.details.push(detail);
    });
  }

  if (status === 415) {
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
