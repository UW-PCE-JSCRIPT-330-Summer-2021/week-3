const mongoose = require('mongoose');

const Book = require('../models/book');

module.exports = {};

module.exports.search = (page, perPage, query) => {
  return Book.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(perPage).skip(perPage * page).lean()
}

module.exports.getAll = (page, perPage, authorId) => {
  if (authorId) {
    return Book.find(
      { authorId: mongoose.Types.ObjectId(authorId) }
    ).limit(perPage).skip(perPage * page).lean()
  } else {
    return Book.find().limit(perPage).skip(perPage * page).lean();
  }
}

module.exports.getStats = (page, perPage, authorInfo) => {
  if (authorInfo) {
    return Book.aggregate([
      {
        $lookup: {from: "authors", localField: "authorId", foreignField: "_id", as: "author"}
      },
      { $unwind: '$author'},
      {
        $group: {_id: "$authorId", numBooks: { $sum: 1 }, authorId: { $first: "$authorId" },
          averagePageCount: { $avg: "$pageCount" }, titles: { $push: "$title" }, author: { $first: "$author" }}
      },
      { $project: { _id: 0, } },
    ]);
  } else {
    return Book.aggregate([
      {
        $group: {_id: "$authorId", numBooks: { $sum: 1 }, authorId: { $first: "$authorId" },
          averagePageCount: { $avg: "$pageCount" }, titles: { $push: "$title" }}
      },
      { $project: { _id: 0, } },
    ]);
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

class BadDataError extends Error { };
module.exports.BadDataError = BadDataError;
