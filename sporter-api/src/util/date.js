const getStartingDate = (strDate) => {
  const date = new Date(strDate);

  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};

const getEndingDate = (strDate) => {
  const date = new Date(strDate);

  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 59);
};

module.exports = {
  getStartingDate,
  getEndingDate,
};
