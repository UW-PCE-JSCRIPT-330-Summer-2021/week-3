const mongoose = require('mongoose');

const Author = require('../models/author');

module.exports = {};

module.exports.getAll = (page, perPage) => {
  return Author.find().limit(perPage).skip(perPage*page).lean();
}

module.exports.getById = (authorId) => {
  if (!mongoose.Types.ObjectId.isValid(authorId)) {
    return null;
  }
  return Author.findOne({ _id: authorId }).lean();
}

module.exports.deleteById = async (authorId) => {
  if (!mongoose.Types.ObjectId.isValid(authorId)) {
    return false;
  }
  await Author.deleteOne({ _id: authorId });
  return true;
}

module.exports.updateById = async (authorId, newObj) => {
  if (!mongoose.Types.ObjectId.isValid(authorId)) {
    return false;
  }
  await Author.updateOne({ _id: authorId }, newObj);
  return true;
}

module.exports.create = async (authorData) => {
  try {
    const created = await Author.create(authorData);
    return created;
  } catch (e) {
    if (e.message.includes('validation failed')) {
      throw new BadDataError(e.message);
    }
    throw (e);
  }
}

class BadDataError extends Error {};
module.exports.BadDataError = BadDataError;