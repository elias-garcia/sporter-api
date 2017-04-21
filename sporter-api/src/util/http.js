const createData = (title, data) => {
  const res = {
    data: {

    }
  };

  res.data[title] = data;

  return res;
};

const createError = (status, message, details) => {
  const res = {
    error: {
      status,
      message
    }
  };

  if (details) {
    res.error.details = [];
    details.forEach(() => {
      res.error.details.push(detail);
    });
  }

  return res;
};

module.exports = {
  createData,
  createError
};
