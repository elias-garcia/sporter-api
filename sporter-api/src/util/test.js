const eventIntensity = require('../api/event/event-intensity.enum');

const createSport = name => ({ name });

const createUser = email => ({
  email,
  password: 'testpassword',
  firstName: 'User',
  lastName: 'Test',
  age: 30,
  location: 'Madrid, Spain',
});

const createEventDb = (userId, sportId) => {
  const event = {
    name: 'Test Event',
    location: {
      coordinates: [40.714224, -73.961452],
    },
    sport: sportId,
    start_date: '2017-10-28T18:00:00Z',
    ending_date: '2017-10-28T19:00:00Z',
    description: 'Event description',
    intensity: eventIntensity.LOW,
    paid: false,
    host: userId,
    players: [userId],
  };
  return event;
};

const createEventPost = (sportId) => {
  const event = {
    name: 'Test Event',
    coordinates: [40.714224, -73.961452],
    sportId,
    start_date: '2017-10-28T18:00:00Z',
    ending_date: '2017-10-28T19:00:00Z',
    description: 'Event description',
    intensity: eventIntensity.LOW,
    paid: false,
  };
  return event;
};

module.exports = {
  createSport,
  createUser,
  createEventDb,
  createEventPost,
};
