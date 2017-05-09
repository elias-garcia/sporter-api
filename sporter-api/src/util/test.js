const Sport = require('../api/sport/sport.model');
const User = require('../api/user/user.model');
const Event = require('../api/event/event.model');
const eventIntensity = require('../api/event/event-intensity.enum');

const createSport = () => {
  return { name: 'Soccer' };
};

const createUser = () => {
  return {
    email: 'user@test.com',
    password: 'testpassword',
    first_name: 'User',
    last_name: 'Test',
    age: 30,
    location: 'Madrid, Spain'
  };
};

const createEvent = (name, location, sport, start_date, ending_date, description, host) => {
  return {
    name,
    location,
    sport: sport,
    start_date,
    ending_date,
    description,
    intensity: eventIntensity.LOW ,
    paid: false,
    host: host
  };
};

module.exports = {
  createSport,
  createUser,
  createEvent
};
