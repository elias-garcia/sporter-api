const bodyParser = require('body-parser');
const morgan = require('morgan');
const middleware = require('../middleware/index');
const routes = require('../api/index');
const error = require('../util/error');
const appConfig = require('./app.config');
const ApiError = require('../api/api-error');

const configure = (app) => {
  /* Server configuration */
  app.set('port', appConfig.port);

  /* Utilities configuration */
  app.use(bodyParser.json());
  app.use(morgan('dev'));

  /* Accept only Content Type application/json */
  app.use(middleware.acceptJson);

  /* Set the application/json Content Type on all responses */
  app.use(middleware.setJson);

  /* Endpoints that requires authentication/authorization */
  app.put(`${appConfig.path}/users/:userId`, middleware.authenticate);
  app.patch(`${appConfig.path}/users/:userId`, middleware.authenticate);
  app.delete(`${appConfig.path}/users/:userId`, middleware.authenticate);
  app.post(`${appConfig.path}/events`, middleware.authenticate);
  app.put(`${appConfig.path}/events/:eventId`, middleware.authenticate);
  app.patch(`${appConfig.path}/events/:eventId`, middleware.authenticate);
  app.delete(`${appConfig.path}/events/:eventId`, middleware.authenticate);

  /* Routing configuration */
  app.use(appConfig.path, routes);

  /* Error handler for non existing routes */
  app.use((req, res, next) => {
    next(new ApiError(501, 'not implemented'));
  });

  /* Error handler for runtime and API errors */
  app.use(error.handler);
};

module.exports = configure;
