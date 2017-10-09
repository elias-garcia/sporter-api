/* eslint no-underscore-dangle: 0 */
const helper = (doc) => {
  const ret = Object.assign({}, doc.toObject());

  ret.id = doc._id;
  delete ret._id;
  delete ret.__v;

  return ret;
};

const transform = (doc) => {
  switch (Object.prototype.toString.call(doc)) {
    case '[object Array]':
      return doc.map(elem => helper(elem));
    case '[object Object]':
      return helper(doc);
    default:
      throw new Error('Only objects or arrays are allowed');
  }
};

module.exports = {
  transform,
};
