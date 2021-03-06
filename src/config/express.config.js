const Raven = require('raven');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const middleware = require('../middleware/index');
const routes = require('../api/index');
const error = require('../util/error');
const appConfig = require('./app.config');
const ApiError = require('../api/api-error');

const configure = (app) => {
  /* Configure Raven to log if in prod mode */
  Raven.config(
    appConfig.sentryDsn,
    {
      shouldSendCallback: () => process.env.NODE_ENV === 'production',
    },
  ).install();

  /* Raven request log */
  app.use(Raven.requestHandler());

  /* Use morgan to log if in dev mode */
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  /* Basic security protection */
  app.use(helmet());

  /* Accept origins */
  app.use(middleware.accessControl);

  /* Server configuration */
  app.set('port', appConfig.port);

  /* Use json as body request parser */
  app.use(express.json());

  /* Accept only Content Type application/json */
  app.use(middleware.acceptJson);

  /* Set the application/json Content Type on all responses */
  app.use(middleware.setJson);

  /* Endpoints that requires authentication */
  app.put(`${appConfig.path}/users/:userId`, middleware.auth);
  app.patch(`${appConfig.path}/users/:userId`, middleware.auth);
  app.delete(`${appConfig.path}/users/:userId`, middleware.auth);
  app.post(`${appConfig.path}/events`, middleware.auth);
  app.put(`${appConfig.path}/events/:eventId`, middleware.auth);
  app.delete(`${appConfig.path}/events/:eventId`, middleware.auth);
  app.post(`${appConfig.path}/events/:eventId/players`, middleware.auth);
  app.delete(`${appConfig.path}/events/:eventId/players/:playerId`, middleware.auth);
  app.post(`${appConfig.path}/users/:userId/ratings`, middleware.auth);
  app.put(`${appConfig.path}/users/:userId/ratings/:ratingId`, middleware.auth);
  app.delete(`${appConfig.path}/users/:userId/ratings/:ratingId`, middleware.auth);

  /* Routing configuration */
  app.use(appConfig.path, routes);

  /* Error handler for non existing routes */
  app.use((req, res, next) => {
    next(new ApiError(501, 'not implemented'));
  });

  /* Error handler for Raven */
  app.use(Raven.errorHandler());

  /* Error handler for runtime and API errors */
  app.use(error.handler);
};

module.exports = configure;
