const express = require('express');
const config = require('./config/index');

const app = express();

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

config.express(app);
config.mongoose();

app.listen(app.get('port'), () => {
  console.log(`API running on port ${app.get('port')}`);
});

module.exports = app;
