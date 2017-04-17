const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const configure = (app, config) => {

  app.set('port', config.port);

  app.use(bodyParser.json());

  app.use(morgan('dev'));

};

module.exports = configure;
