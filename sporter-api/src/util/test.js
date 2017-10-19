const eventIntensity = require('../api/event/event-intensity.enum');
const eventStatus = require('../api/event/event-status.enum');

const createSport = name => ({ name });

const createUser = email => ({
  email,
  password: 'testpassword',
  firstName: 'User',
  lastName: 'Test',
  age: 30,
  location: 'Madrid, Spain',
});

const createEventDb = (userId, sportId, offsetDays) => {
  const now = new Date();
  now.setDate(now.getDate() + offsetDays);

  const after = now;
  after.setHours(after.getHours() + 2);

  const event = {
    name: 'Test Event',
    location: {
      coordinates: [-8.407628, 43.367373],
    },
    sport: sportId,
    startDate: now,
    endingDate: after,
    description: 'Event description',
    intensity: eventIntensity.LOW,
    status: eventStatus.WAITING,
    paid: false,
    host: userId,
    players: [userId],
  };
  return event;
};

const createEventPost = (sportId) => {
  let now = new Date();
  now.setHours(now.getHours() + 2);
  now = now.toISOString();

  let after = new Date(now);
  after.setHours(after.getHours() + 2);
  after = after.toISOString();

  const event = {
    name: 'Test Event',
    coordinates: [43.367373, -8.407628],
    sportId,
    startDate: now,
    endingDate: after,
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
