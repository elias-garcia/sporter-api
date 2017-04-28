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

const createEvent = (host, sport) => {
  return {
    name: 'New event',
    location: 'Av. Felipe II, S/N, 28009 Madrid',
    sport: sport,
    start_date: '2017-05-28T18:00:00Z',
    ending_date: '2017-05-28T19:00:00Z',
    description: 'New event description',
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
