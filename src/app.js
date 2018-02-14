const express = require('express');
const http = require('http');
const config = require('./config/index');
const io = require('./websockets/socket-io');

const app = express();
const server = new http.Server(app);

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

config.express(app);
config.mongoose();
io.configure(server);

server.listen(app.get('port'), () => {
  console.log(`API running on port ${app.get('port')}`);
});

module.exports = app;
