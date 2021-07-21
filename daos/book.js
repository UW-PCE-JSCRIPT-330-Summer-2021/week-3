//REFERRED BACK TO LECTURE VIDEO FOR LECTURE EXAMPLES

const mongoose = require('mongoose');

const Book = require('../models/book');

module.exports = {};

module.exports.getAll = (page, perPage) => {
  return Book.find().limit(perPage).skip(perPage*page).lean();
}

//DAO for search
module.exports.searchQuery = (page, perPage, query) => {
  if (query) {
    return Book.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }).
      sort( { score: { $meta: '$textScore' } }).
      limit(perPage).skipPage(perPage*page).lean()
  }

  else {
    return Book.find().limit(perPage.skip(perPage*page).lean();
  }
}

//DAO for AuthorID
module.exports.getAuthorId = (authorId) => {
  if (!mongoose.Types.ObjectId.isValid(authorId)) {
    return null;
  }
  return Book.find( { authorId: authorId }).lean();
}

//DAO for AuthorStats
//Aggregation
module.exports.getAuthorStats = (authorStat, page, perPage) => {
  if (authorStat) {
    return Book.aggregate([
      { $lookup: {
        from: 'authors',
        localField: 'authorId',
        foreignField: '_id',
        as: 'author'
      } },
      { $unwind: '$author'},
      { $group: {
        _id: '$authorId',
        author: { $first: '$author' },
        authorId: { $first: '$authorId' },
        averagePageCount: { $avg: '$pageCount' },
        numBooks: { $sum: 1 },
        titles: { $push: '$title' }
      } },
      { $project: { _id: 0
      } }
    ]).limit(perPage).skip(perPage*page);
  }

  else {
    return Book.aggregate([
      { $group: {
        _id: '$authorId',
        author: { $first: '$author' },
        authorId: { $first: '$authorId' },
        averagePageCount: { $avg: '$pageCount' },
        numBooks: { $sum: 1 },
        titles: { $push: '$title' }
      } },
      { $project: { _id: 0
      } }
    ]).limit(perPage).skip(perPage*page);
  }
}

module.exports.getById = (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return null;
  }
  return Book.findOne({ _id: bookId }).lean();
}

module.exports.deleteById = async (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return false;
  }
  await Book.deleteOne({ _id: bookId });
  return true;
}

module.exports.updateById = async (bookId, newObj) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return false;
  }
  await Book.updateOne({ _id: bookId }, newObj);
  return true;
}

module.exports.create = async (bookData) => {
  try {
    const created = await Book.create(bookData);
    return created;
  } catch (e) {
    if (e.message.includes('validation failed')) {
      throw new BadDataError(e.message);
    }
    throw e;
  }
}

class BadDataError extends Error {};
module.exports.BadDataError = BadDataError;