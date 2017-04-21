const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const middleware = require('../middleware/index');
const routes = require('../api/index');
const error = require('../util/error');

const configure = (app, config) => {

  /* Server configuration */
  app.set('port', config.port);
  
  /* Utilities configuration */
  app.use(bodyParser.json());
  app.use(morgan('dev'));

  /* Endpoints that requires authorization */
  app.get('/users', middleware.authorize);
  app.put('/users', middleware.authorize);
  app.delete('/users', middleware.authorize);
  app.use('/users/*', middleware.authorize);

  /* Routing configuration */
  app.use('/api', routes);

  /* Error handler for non existing routes */
  app.use(error.handle404);

  /* Error handler for unexpected errors */
  app.use(error.handle500);

};

module.exports = configure;
