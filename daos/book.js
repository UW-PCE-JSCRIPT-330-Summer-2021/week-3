const mongoose = require('mongoose');

const Book = require('../models/book');

module.exports = {};

module.exports.getAll = (page, perPage, authorId) => {
  try {
    if (authorId) {
      return Book.find({ authorId: authorId }).limit(perPage).skip(perPage*page).lean();
    } else {
      return Book.find().limit(perPage).skip(perPage*page).lean();
    }
  } catch (e) {
    throw e;
  }
}

module.exports.search = (page, perPage, query) => {
  try {
    if (query) {
      return Book.find(
        { $text: { $search: query }},
        { score: { $meta: 'textScore' }})
        .sort({ score: { $meta: 'textScore' }})
        .limit(perPage).skip(perPage*page).lean();
    } else {
      return Book.find().limit(perPage).skip(perPage*page).lean();
    }
  } catch (e) {
    throw e;
  }
}

module.exports.authorStats = (page, perPage, authorInfo) => {
  try {
    if (authorInfo) {
      return Book.aggregate([
        { $lookup: {
          from: 'authors',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author'
        }},
        { $unwind: '$author' },
        { $group: {
          _id: '$authorId',
          authorId: { $first: '$authorId'},
          averagePageCount: { $avg: '$pageCount' },
          numBooks: { $sum: 1 },
          titles: { $push: '$title' },
          author: { $first: '$author'},
        }},
        { $project: {
           _id: 0 
        }}
      ])
    } else {
      return Book.aggregate([
        { $group: {
          _id: '$authorId',
          authorId: { $first: '$authorId'},
          averagePageCount: { $avg: '$pageCount' },
          numBooks: { $sum: 1 },
          titles: { $push: '$title' }
        }},
        { $project: { 
          _id: 0 
        }}
      ])
    } 
  } catch (e) {
    throw e;
  }
}

module.exports.getById = (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return null;
  }
  return Book.findOne({ _id: bookId }).lean();
}

module.exports.deleteById = async (bookId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return false;
    }
    await Book.deleteOne({ _id: bookId });
    return true;
  } catch (e) {
    throw e;
  }
}

module.exports.updateById = async (bookId, newObj) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return false;
    }
    await Book.updateOne({ _id: bookId }, newObj);
    return true;
  } catch (e) {
    throw e;
  }
}

module.exports.create = async (bookData) => {
  try {
    const created = await Book.create(bookData);
    return created;
  } catch (e) {
    if (e.message.includes('validation failed') || ('E11000 duplicate key error')) {
      throw new BadDataError(e.message);
    }
    throw e;
  }
}

class BadDataError extends Error {};
module.exports.BadDataError = BadDataError;