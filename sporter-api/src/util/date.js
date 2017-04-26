const startDate = (strDate) => {
  const date = new Date(strDate);

  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};

const endDate = (strDate) => {
  const date = new Date(strDate);

  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 59);
};

module.exports = {
  startDate,
  endDate
};
