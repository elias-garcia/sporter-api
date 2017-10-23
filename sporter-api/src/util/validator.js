const validator = require('validator');
const moment = require('moment');

const isBoolean = value => typeof (value) === 'boolean';

const isInt = value => value && validator.isInt(value.toString());

const isNumber = value => typeof value === 'number' && !Number.isNaN(parseFloat(value));

const isString = value => typeof (value) === 'string';

const isISO8601 = value => isString(value) && moment(value, 'YYYY-MM-DDTHH:mm:ssZZ', true).isValid();

const isDateAfter = (date1, date2) =>
  isISO8601(date1) && isISO8601(date2) && moment(date1).isAfter(moment(date2));

const isDateAfterNow = date => isISO8601(date) && moment(date).isAfter();

const isEmail = email => isString(email) && validator.isEmail(email);

const isLatLong = value => isString(value)
  && validator.isLatLong(value)
  && !Number.isNaN(parseFloat(value.split(',')[0]))
  && !Number.isNaN(parseFloat(value.split(',')[1]));

const isLatLongArray = arr => arr
  && arr.length === 2
  && !Number.isNaN(parseFloat(arr[0]))
  && !Number.isNaN(parseFloat(arr[1]))
  && validator.isLatLong(arr.toString());

const isMongoId = value => isString(value) && validator.isMongoId(value);

module.exports = {
  isBoolean,
  isDateAfter,
  isDateAfterNow,
  isEmail,
  isInt,
  isISO8601,
  isLatLong,
  isLatLongArray,
  isMongoId,
  isNumber,
  isString,
};
