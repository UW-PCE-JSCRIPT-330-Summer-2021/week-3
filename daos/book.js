const mongoose = require('mongoose');

const Book = require('../models/book');

module.exports = {};

module.exports.getAll = (page, perPage) => {
  return Book.find().limit(perPage).skip(perPage*page).lean();
}

module.exports.getAllByAuthor = (authorId, page, perPage) => {
  return Book.find({authorId}).limit(perPage).skip(perPage*page).lean();
}

module.exports.getStatusByAuthor = (authorInfo, page, perPage) => {
  if(authorInfo) {
    return Book.aggregate([
      { $lookup: { from: "authors", localField: "authorId", foreignField: "_id", as: "author" }},
      { $unwind: "$author"},
      { $group: {
        author: {$first: "$author"},
        _id: "$authorId",
        avgPageCount: { $avg: "$pageCount"},
        countBooks: { $sum: 1 },
        titles: { $push: "$title"},
        author: { $push: "$author"}
      }},
      { "$project": {
        _id: 0
      }}
    ]).limit(perPage).skip(perPage*page);
  } else {
    return Book.aggregate([
      { $group: {
        _id: "$authorId",
        avgPageCount: { $avg: "$pageCount"},
        countBooks: { $sum: 1},
        titles: { $push: "$title"}
      }},
      { $project: {
        _id: 0
      }}
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
    if (e.message.includes('validation failed') || e.message.includes('duplicate')) {
      throw new BadDataError(e.message);
    }
    throw e;
  }
}

module.exports.search = (query, page, perPage) => {
  return Book.find(
    { $text: {$search: query }},
    { score: {$meta: 'textScore' }},
  ).sort( {score: {$meta: 'textScore' }}
  ).limit(perPage).skip(perPage*page).lean()
}

class BadDataError extends Error {};
module.exports.BadDataError = BadDataError;