const mongoose = require('mongoose');

const Book = require('../models/book');

module.exports = {};

module.exports.getAll = (page, perPage, query, bookScore, bookSort) => {
  return Book.find(query, bookScore).sort(bookSort).limit(perPage).skip(perPage*page).lean();
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

module.exports.getByIsbn = (isbnId) => {
  return Book.findOne({ ISBN: isbnId }).lean();
}

module.exports.getStats = (authorInfo) => {
  let getFilter;
  if (authorInfo) {
    filter.authorInfo = { authorInfo };
  }
  // let updated = Math.ceil(doc.money/num); 
// },{$set:{"money":updated}}
  return Book.aggregate([
    // { $match: getFilter },
    { $group: {_id: '$authorId', 
      titles: { $addToSet: '$title' }, numBooks: { $sum: 1 }, 
              pageCountTotal: { $sum: '$pageCount' }}},
    { $project: { 
      _id: 0, 
      authorId: "$_id",
      averagePageCount: {$divide :['$pageCountTotal', '$numBooks']},
      numBooks: 1,
      titles: 1
      }
    }
  ])
  // return Author.find(query, authorScore).sort(authorSort).limit(perPage).skip(perPage*page).lean();
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