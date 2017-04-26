const mongoose = require('mongoose');
const userSchema = mongoose.model('User').schema;
const sportSchema = mongoose.model('Sport').schema;
const eventStatus = require('./event-status.enum');
const eventIntensity = require('./event-intensity.enum');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  sport: {
    type: sportSchema,
    required: true
  },
  start_date: {
    type: Date,
    required: true,
  },
  ending_date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  intensity: {
    type: String,
    enum: Object.keys(eventIntensity).map(key => eventIntensity[key]),
    required: true
  },
  paid: {
    type: boolean,
    required: true
  },
  status: {
    type: String,
    enum: Object.keys(eventStatus).map(key => eventStatus[key]),
    default: eventStatus.WAITING
  },
  host: {
    type: userSchema,
    required: true
  },
  players: [ userSchema ],
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
