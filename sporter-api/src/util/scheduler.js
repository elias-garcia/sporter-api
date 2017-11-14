const Agenda = require('agenda');
const appConfig = require('../config/app.config');

const scheduler = new Agenda({ db: { address: appConfig.mongo } });

scheduler.on('ready', () => {
  console.log('Scheduler instantiation');
  scheduler.start();
});

scheduler.on('error', () => {
  process.exit(0);
});

module.exports = scheduler;
