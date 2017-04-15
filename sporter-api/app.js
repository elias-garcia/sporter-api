const express = require('express');
const config = require('./config/index');

app = express();

config.express(app, config.app);

config.mongoose(config.app);

app.listen(app.get('port'), () => {
  console.log(`API running on ${app.get('port')}`);
});
