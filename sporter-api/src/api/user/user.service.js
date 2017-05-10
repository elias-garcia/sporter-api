const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const appConfig = require('../../config/app.config');
const User = require('../user/user.model');
const ApiError = require('../api-error');
const validation = require('../../util/validation');

const logIn = async (email, password) => {

  if (!(validation.isString(email) && validation.isString(password))) {
    throw new ApiError(400, 'bad request');
  }
  
  const user = await User.findOne({ email }).exec();

  if (!user) {
    throw new ApiError(401, 'invalid email');
  }

  if (!bcrypt.compareSync(password, user.password)) {
    throw new ApiError(401, 'invalid password');
  }

  const token = jwt.sign({ sub: user._id }, appConfig.jwtSecret, { expiresIn: appConfig.jwtMaxAge });

  return { _id: user._id, token: token };
  
};

const register = async (reqUser) => {

  const oldUser = await User.findOne({ email: reqUser.email }).exec();
  
  if (oldUser) {
    throw new ApiError(409, 'user already exists');
  }

  const newUser = await User.create(reqUser);
  const token = jwt.sign({ sub: newUser._id }, appConfig.jwtSecret, { expiresIn: appConfig.jwtMaxAge });;
  
  return { _id: newUser._id, token: token };

};

const findById = async (userId) => {

  const user = await User.findById(userId, ('-password -__v')).exec();
  
  if (!user) {
    throw new ApiError(404, 'user not found');
  }

  return user;

};

const update = async (userId, newUser, reqPayload) => {

  if (!reqPayload || reqPayload.sub !== userId) {
    throw new ApiError(403, 'you are not allowed to access this resource');
  }

  const user = await User.findById(userId).exec();
  
  if (!user) {
    throw new ApiError(404, 'user not found');
  }
  
  return await user.update(newUser);

};

const remove = async (userId, reqPayload) => {

  if (!reqPayload || reqPayload.sub !== userId) {
    throw new ApiError(403, 'you are not allowed to access this resource');
  }

  const user = await User.findById(userId).exec();
  
  if (!user) {
    throw new ApiError(404, 'user not found');
  }
  
  return await user.remove();

}

module.exports = {
  logIn,
  register,
  findById,
  update,
  remove
}
