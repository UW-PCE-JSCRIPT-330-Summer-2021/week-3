const { query } = require('express');
const mongoose = require('mongoose');
const author = require('../models/author');

const Book = require('../models/book');

module.exports = {};

module.exports.getAll = (page, perPage, authorId) => {
  if (authorId) {
    return Book.find({ authorId: authorId }).limit(perPage).skip(PerPage * page).lean();
  } else {
    return Book.find().limit(perPage).skip(perPage * page).lean();
  }
}

//Could be another way to access by authorId if not specified in getAll module
//Similar framework to getById
/* module.exports.getByAuthorId = (authorId) => {
  if (!mongoose.Types.ObjectId.isValid(authorId)) {
    return null;
  }
  return Book.find({ authorId: authorId }).lean();
} */

//Similar to the Week 3's in class code along exercise
model.exports.getByQuery = (page, perPage, query) => {
  if (query) {
    return Book.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: '$textScore' } })
      .limit(perPage).skip(perPage * page).lean();
  } else {
    return Book.find().limit(perPage).skip(perPage * page).lean();
  }
}

//Implementing Aggregations similar to Week 3 in class exercise
module.exports.getByAuthorStat = (page, perPage, authorStat) => {
  if (authorStat) {
    return Book.aggregate([
      {
        $lookup: {
          from: 'authors',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $unwind: '$author'
      },
      {
        $group: {
          _id: '$authorId',
          author: { $first: '$author' },
          authorId: { $first: '$authorId' },
          averagePageCount: { $avg: '$pageCount' },
          numBooks: { $sum: 1 },
          titles: { $push: '$title' }
        }
      },
      {
        $project: {
          _id: 0
        }
      }
    ]).limit(perPage).skip(perPage * page);
  } else {
    return Book.aggregate([
      {
        $group: {
          _id: '$authorId',
          authorId: { $first: '$authorId' },
          averagePageCount: { $avg: 'pageCount' },
          numBooks: { $sum: 1 },
          titles: { $push: '$title' }
        }
      },
      {
        $project: {
          _id: 0
        }
      }
    ]).limit(perPage).skip(perPage * page);
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
    if (e.message.includes('validation failed') || e.message.includes('error: duplicate')) {
      throw new BadDataError(e.message);
    }
    //Similar to || above
    /* if (e.message.includes('error: duplicate')) {
      throw new BadDataError(e.message);
    } */
    throw e;
  }
}

class BadDataError extends Error { };
module.exports.BadDataError = BadDataError;