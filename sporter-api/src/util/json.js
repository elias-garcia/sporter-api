const createData = (title, data) => {
  const content = {
    data: {}
  };

  content.data[title] = data;

  return content;
};

const createError = (status, message) => {
  const content = {
    error: {
      status,
      message
    }
  };

  return content;
};

module.exports = {
  createData,
  createError
};
