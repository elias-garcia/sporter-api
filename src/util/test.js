const moment = require('moment');
const eventIntensity = require('../api/event/event-intensity.enum');
const eventStatus = require('../api/event/event-status.enum');

const createSport = name => ({ name });

const createUser = email => ({
  email,
  password: 'testpassword',
  passwordConfirm: 'testpassword',
  firstName: 'User',
  lastName: 'Test',
  birthdate: '1995-12-21',
  location: 'Madrid, Spain',
});

const createEventDb = (userId, sportId, offsetDays) => {
  const now = moment();
  now.add(offsetDays, 'days');

  const after = now.clone();
  after.add(2, 'hours');

  const event = {
    name: 'Test Event',
    location: {
      coordinates: [-8.407628, 43.367373],
    },
    sport: sportId,
    startDate: now.utc().toDate(),
    endingDate: after.utc().toDate(),
    description: 'Event description',
    intensity: eventIntensity.LOW,
    status: eventStatus.WAITING,
    maxPlayers: 2,
    fee: 0,
    host: userId,
    players: [userId],
  };
  return event;
};

const createEventPost = (sportId) => {
  const now = moment();
  now.add(2, 'hours');

  const after = now.clone();
  after.add(2, 'hours');

  const event = {
    name: 'Test Event',
    location: [43.367373, -8.407628],
    sport: sportId,
    startDate: now.format(),
    endingDate: after.format(),
    description: 'Event description',
    intensity: eventIntensity.LOW,
    maxPlayers: 2,
    fee: 0,
  };
  return event;
};

module.exports = {
  createSport,
  createUser,
  createEventDb,
  createEventPost,
};
