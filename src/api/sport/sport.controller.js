const sportService = require('./sport.service');
const json = require('../../util/json');
const sportDto = require('./sport.dto');

const findAll = async (req, res, next) => {
  try {
    const sports = await sportService.findAll();

    return res.status(200).json(json.createData('sports', sportDto.toSportsDto(sports)));
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  findAll,
};
