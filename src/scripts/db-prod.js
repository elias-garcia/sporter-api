const Sport = require('../api/sport/sport.model');

const init = () => {
  Sport.create({ name: 'Fútbol' });
  Sport.create({ name: 'Baloncesto' });
  Sport.create({ name: 'Tenis' });
};

module.exports = {
  init,
};
