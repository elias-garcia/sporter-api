const validator = require('validator');

const isBoolean = (value) => {
  return typeof (value) === 'boolean';
}

const isDateAfter = (date1, date2) => {
  return isISO8601(date1) && isISO8601(date2) && validator.isAfter(date1, date2);
}

const isDateAfterNow = (date) => {
  return isISO8601(date) && validator.isAfter(date);
}

const isEmail = (email) => {
  return isString(email) && validator.isEmail(email);
}

const isInt = (value) => {
  return value && validator.isInt(value.toString());
}

const isISO8601 = (value) => {
  return isString(value) && validator.isISO8601(value);
}

const isLatLong = (value) => {
  return typeof (value) === string
    && validator.isLatLong(value)
    && typeof (Number(value.split(',')[0])) === 'Number'
    && typeof (Number(value.split(',')[1])) === 'Number'
}

const isLatLongArray = (arr) => {
  return arr
    && arr.length === 2
    && isNumber(arr[0])
    && isNumber(arr[1])
    && validator.isLatLong(arr.toString());
}

const isMongoId = (value) => {
  return isString(value) && validator.isMongoId(value);
}

const isNumber = (value) => {
  return typeof (value) === 'number';
}

const isString = (value) => {
  return typeof (value) === 'string';
}

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
  isString
}
