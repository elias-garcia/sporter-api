const mongoose = require('mongoose');
const eventStatus = require('./event-status.enum');
const eventIntensity = require('./event-intensity.enum');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: { type: String, default: 'Point', required: true },
    coordinates: { type: [Number], required: true, index: '2dsphere' },
  },
  sport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sport',
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
    type: Boolean,
    required: true
  },
  status: {
    type: String,
    enum: Object.keys(eventStatus).map(key => eventStatus[key]),
    default: eventStatus.WAITING
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
