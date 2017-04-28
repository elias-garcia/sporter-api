const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const middleware = require('../middleware/index');
const routes = require('../api/index');
const error = require('../util/error');
const appConfig = require('./app.config');

const configure = (app, config) => {

  /* Server configuration */
  app.set('port', config.port);
  
  /* Utilities configuration */
  app.use(bodyParser.json());
  app.use(morgan('dev'));

  /* Accept only Content Type application/json */
  app.use(middleware.contentType);

  /* Set the application/json Content Type on all responses */
  app.use((req, res, next) => {
    res.set('Content-Type', 'application/json');
    return next();
  });

  /* Endpoints that requires authorization */
  app.put('/users/*', middleware.authorize);
  app.delete('/users/*', middleware.authorize);
  app.post('/events', middleware.authorize);
  app.put('/events/*', middleware.authorize);
  app.patch('/events/*', middleware.authenticate);
  app.delete('/events/*', middleware.authorize);

  /* Routing configuration */
  app.use(appConfig.path, routes);

  /* Error handler for non existing routes */
  app.use(error.handle404);

  /* Error handler for unexpected errors */
  app.use(error.handle500);

};

module.exports = configure;
