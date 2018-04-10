const Sport = require('../api/sport/sport.model');

const init = async () => {
  await Sport.remove({});
  await Sport.create({ name: 'Fútbol' });
  await Sport.create({ name: 'Baloncesto' });
  await Sport.create({ name: 'Tenis' });
};

module.exports = {
  init,
};
