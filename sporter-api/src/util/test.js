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

const createEventDb = (userId, sportId, offsetDays) => {
  let now = new Date();
  let after;

  now.setDate(now.getDate() + offsetDays);
  after = now;
  now = now.toISOString();
  after.setHours(after.getHours() + 2);
  after = after.toISOString();

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
    paid: false,
    host: userId,
    players: [userId],
  };
  return event;
};

const createEventPost = (sportId) => {
  const now = new Date().toISOString();
  let after = new Date();

  after.setHours(after.getHours() + 2);
  after = after.toISOString();

  const event = {
    name: 'Test Event',
    coordinates: [-8.407628, 43.367373],
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
