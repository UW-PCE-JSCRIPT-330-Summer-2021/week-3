const mongoose = require('mongoose');

const Book = require('../models/book');

module.exports = {};

module.exports.getAll = (authorId, page, perPage) => {
  if (authorId) {
    return Book.find({ authorId }).limit(perPage).skip(perPage*page).lean();
  } else {
    return Book.find().limit(perPage).skip(perPage*page).lean();
  }
}

module.exports.getById = (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return null;
  }
  return Book.findOne({ _id: bookId }).lean();
}

module.exports.search = (page, perPage, query) => {
  if (query) {
    return Book.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } } )
      .sort({ score: { $meta: 'textScore' }}).limit(perPage).skip(perPage*page).lean();
  } else {
    return Book.find().limit(perPage).skip(perPage*page).lean();
  } 
}

module.exports.getStats = (authorInfo, page, perPage) => {
  if (authorInfo) {
    return Book.aggregate([
      { $lookup: {
        from: 'authors',
        localField: 'authorId',
        foreignField: '_id',
        as: 'author'
      }},
      { $group: {
        author: { $first: '$author' },
        _id: '$authorId',
        authorId: { $first: '$authorId' },
        averagePageCount: { $avg: '$pageCount' },
        numBooks: { $sum: 1 },
        titles: { $push: '$title' }
      }},
      { $project : { 
        _id: 0 
      }},
      { $unwind: '$author'},
      { $sort: { titles: 1 } }
    ]).limit(perPage).skip(perPage*page);
  } else {
    return Book.aggregate([
      { $group: {
        _id: '$authorId',
        authorId: { $first: '$authorId' },
        averagePageCount: { $avg: '$pageCount' },
        numBooks: { $sum: 1 },
        titles: { $push: '$title' }
      }},
      { $project : { 
        _id: 0 
      }},
      { $sort: { titles: 1 } }
    ]).limit(perPage).skip(perPage*page);
  }
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
    if (e.message.includes('validation failed') || e.message.includes('E11000 duplicate key error ')) {
      throw new BadDataError(e.message);
    }
    throw e;
  }
}

class BadDataError extends Error {};
module.exports.BadDataError = BadDataError;