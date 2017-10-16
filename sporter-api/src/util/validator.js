const validator = require('validator');

const isBoolean = value => typeof (value) === 'boolean';

const isInt = value => value && validator.isInt(value.toString());

const isNumber = value => typeof value === 'number' && !Number.isNaN(parseFloat(value));

const isString = value => typeof (value) === 'string';

const isISO8601 = value => isString(value) && validator.isISO8601(value);

const isISO8601Date = (value) => {
  const values = value.split('-');

  return isISO8601(value)
    && value.length === 10
    && values
    && values.length === 3
    && values[0].length === 4
    && values[1].length === 2
    && values[2].length === 2;
};

const isISO8601UTCTime = (value) => {
  const values = value.split(':');

  return isISO8601(value)
    && value.length === 8
    && values[0].length === 2
    && values[1].length === 2
    && values[2].length === 2;
};

const isISO8601UTCDateTime = value => isISO8601(value)
  && isISO8601Date(value.split('T')[0])
  && isISO8601UTCTime(value.split('T')[1]);

const isDateAfter = (date1, date2) =>
  isISO8601(date1) && isISO8601(date2) && validator.isAfter(date1, date2);

const isDateAfterNow = date => isISO8601(date) && validator.isAfter(date);

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
  isISO8601Date,
  isISO8601UTCTime,
  isISO8601UTCDateTime,
  isLatLong,
  isLatLongArray,
  isMongoId,
  isNumber,
  isString,
};
