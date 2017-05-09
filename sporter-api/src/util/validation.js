const moment = require('moment');

const isString = (string) => {
  return (typeof string === 'string');
};

const isIsoDate = (date) => {
  return moment(date, moment.ISO_8601).isValid();
};

const isInt = (int) => {
  return (typeof int === 'number' && (int % 1) === 0);
};

const isFloat = (number) => {
  return (typeof number === 'number');
};

module.exports = {
  isString,
  isIsoDate,
  isInt,
  isFloat
}
