const createData = (arr) => {
  const content = {
    data: {},
  };

  arr.forEach((elem) => {
    content.data[elem.title] = elem.data;
  });

  return content;
};

const createError = (status, message) => {
  const content = {
    error: {
      status,
      message,
    },
  };

  return content;
};

module.exports = {
  createData,
  createError,
};
