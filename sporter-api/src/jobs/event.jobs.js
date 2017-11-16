const jobTypes = require('./job-types.enum');
const eventStatus = require('../api/event/event-status.enum');
const Event = require('../api/event/event.model');

const cancelEventJob = (jobTypes.EVENT_CONFIRM, async (job) => {
  const event = await Event.findById(job.attrs.data.eventId);

  if (event.status === eventStatus.WAITING) {
    event.status = eventStatus.CANCELED;
  }

  if (event.status === eventStatus.FULL) {
    event.status = eventStatus.CONFIRMED;
  }

  await event.save();
});

const startEventJob = (jobTypes.EVENT_START, async (job) => {
  const event = await Event.findById(job.attrs.data.eventId);

  event.status = eventStatus.DISPUTING;

  await event.save();
});

const finishEventJob = (jobTypes.EVENT_FINISH, async (job) => {
  const event = await Event.findById(job.attrs.data.eventId);

  event.status = eventStatus.FINISHED;

  await event.save();
});

module.exports = {
  cancelEventJob,
  startEventJob,
  finishEventJob,
};
