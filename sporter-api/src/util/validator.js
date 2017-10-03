const validator = require('validator');

const isBoolean = value => typeof (value) === 'boolean';

const isInt = value => value && validator.isInt(value.toString());

const isNumber = value => typeof (value) === 'number';

const isString = value => typeof (value) === 'string';

const isISO8601 = value => isString(value) && validator.isISO8601(value);

const isDateAfter = (date1, date2) =>
  isISO8601(date1) && isISO8601(date2) && validator.isAfter(date1, date2);

const isDateAfterNow = date => isISO8601(date) && validator.isAfter(date);

const isEmail = email => isString(email) && validator.isEmail(email);

const isLatLong = value => isString(value)
    && validator.isLatLong(value)
    && isNumber(Number(value.split(',')[0]))
    && isNumber(Number(value.split(',')[1]));

const isLatLongArray = arr => arr
    && arr.length === 2
    && isNumber(arr[0])
    && isNumber(arr[1])
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
