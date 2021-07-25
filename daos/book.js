const mongoose = require('mongoose');

const Book = require('../models/book');

module.exports = {};

module.exports.getAll = (page, perPage, authorId) => {
  if (authorId) {
    return Book.find({ authorId }).limit(perPage).skip(PerPage * page).lean();
  } else {
    return Book.find().limit(perPage).skip(perPage * page).lean();
  }
}

module.exports.getById = (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return null;
  }
  return Book.findOne({ _id: bookId }).lean();
}

//Similar to the Week 3's in class code along exercise
module.exports.searchByQuery = (page, perPage, query) => {
  if (query) {
    return Book.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(perPage)
      .skip(perPage * page)
      .lean();
  } else {
    return Book.find().limit(perPage).skip(perPage * page).lean();
  }
}

//Implementing Aggregations similar to Week 3 in class exercise
module.exports.getByAuthorStat = (page, perPage, authorInfo) => {
  if (authorInfo) {
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
        $group: {
          author: { $first: 'author' },
          _id: '$authorId',
          authorId: { $first: '$authorId' },
          averagePageCount: { $avg: '$pageCount' },
          numBooks: { $sum: 1 },
          titles: { $push: '$title' }
        }
      },
      { $project: {
        _id: 0
       }
      },
      {
        $unwind: 'author'
      },
      {
        $sort: {
          titles: 1
        }
      }
    ]).limit(perPage).skip(perPage * page);
  } else {
    return Book.aggregate([
      {
        $group: {
          _id: '$authorId',
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
      },
      {
        $sort: {
          titles: 1
        }
      }
    ]).limit(perPage).skip(perPage & page);
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
    if (e.message.includes('validation failed') || e.message.includes('Error: Duplicate')) {
      throw new BadDataError(e.message);
    }
    throw e;
  }
}

class BadDataError extends Error { };
module.exports.BadDataError = BadDataError;