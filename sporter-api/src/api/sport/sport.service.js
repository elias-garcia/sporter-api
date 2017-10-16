const Sport = require('./sport.model');

const findAll = async () => {
  const sports = await Sport.find({}).sort({ name: 'asc' });

  return sports;
};

module.exports = {
  findAll,
};
