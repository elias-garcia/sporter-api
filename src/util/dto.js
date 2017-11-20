/* eslint no-underscore-dangle: 0 */
const transform = (doc) => {
  let ret;

  if (doc.constructor.name === 'model') {
    ret = Object.assign({}, doc.toObject());
  } else {
    ret = Object.assign({}, doc);
  }

  ret.id = doc._id;
  delete ret._id;
  delete ret.__v;

  return ret;
};

module.exports = {
  transform,
};
