const Sport = require('../api/sport/sport.model');
const User = require('../api/user/user.model');
const Event = require('../api/event/event.model');
const eventIntensity = require('../api/event/event-intensity.enum');

const createSport = (name) => {
  return { name };
};

const createUser = (email) => {
  return {
    email,
    password: 'testpassword',
    first_name: 'User',
    last_name: 'Test',
    age: 30,
    location: 'Madrid, Spain'
  };
};

const createEventDb = (userId, sportId) => {
  return event = {
    name: 'Test Event',
    location: {
      coordinates: [40.714224, -73.961452]
    },
    sport: sportId,
    start_date: '2017-10-28T18:00:00Z',
    ending_date: '2017-10-28T19:00:00Z',
    description: 'Event description',
    intensity: eventIntensity.LOW,
    paid: false,
    host: userId,
    players: [userId]
  };
};

const createEventPost = (sportId) => {
  return event = {
    name: 'Test Event',
    coordinates: [40.714224, -73.961452],
    sportId,
    start_date: '2017-10-28T18:00:00Z',
    ending_date: '2017-10-28T19:00:00Z',
    description: 'Event description',
    intensity: eventIntensity.LOW,
    paid: false
  };
};

module.exports = {
  createSport,
  createUser,
  createEventDb,
  createEventPost
};
