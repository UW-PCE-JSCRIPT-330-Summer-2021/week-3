const mongoose = require('mongoose');

const Book = require('../models/book');

module.exports = {};

module.exports.getAll = (page, perPage, query) => {
  if (query) {
    console.log('on the query search on the getAll ');
    return Book.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(perPage)
      .skip(perPage * page)
      .lean();
  } else {
    return Book.find()
      .limit(perPage)
      .skip(perPage * page)
      .lean();
  }
};

module.exports.getByisbnId = (isbnId) => {
  // if (!mongoose.Types.ObjectId.isValid(isbnId)) {
  //   return null;
  // }
  console.log('getvyisnbid module');
  try {
    const isbnValidation = Book.findOne({ ISBN: isbnId }).lean();

    return isbnValidation;
  } catch (e) {
    res.status(404);
    //return null;
  }
};

module.exports.getById = (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return null;
  }
  return Book.findOne({ _id: bookId }).lean();
};

module.exports.search = (page, perPage, query) => {
  // db.books
  //   .find(
  //     { $text: { $search: 'Fantasy wizards' } },
  //     { score: { $meta: 'textScore' } }
  //   )
  //   .sort({ score: { $meta: 'textScore' } });

  if (query) {
    console.log('on the query search');
    console.log('On the get search book.find() using Search: query');
    return Book.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(perPage)
      .skip(perPage * page)
      .lean();
  } else {
    console.log('On the get search book.find()');
    return Book.findOne({ title: query })
      .limite(perPage)
      .skip(perPage * page)
      .lean();
  }
};

module.exports.getAllByAuthor = (authorId, page, perPage) => {
  if (!mongoose.Types.ObjectId.isValid(authorId)) {
    return null;
  }
  console.log('get all by authorid on the getAllByAuthor module ');
  console.log(authorId);
  return Book.find({ authorId: authorId })
    .limit(perPage)
    .skip(perPage * page)
    .lean();
};

module.exports.deleteById = async (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return false;
  }
  await Book.deleteOne({ _id: bookId });
  return true;
};

module.exports.updateById = async (bookId, newObj) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return false;
  }
  await Book.updateOne({ _id: bookId }, newObj);
  return true;
};

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
};

module.exports.getauthorstats = async (page, perPage, authorInfo) => {
  if (authorInfo === 'true') {
    return Book.aggregate([
      {
        $lookup: {
          from: 'authors',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: '$author' },
      {
        $group: {
          _id: '$authorId',
          author: { $first: '$author' },
          authorId: { $first: '$authorId' },
          averagePageCount: { $avg: '$pageCount' },
          numBooks: { $sum: 1 },
          titles: { $push: '$title' },
        },
      },
      { $project: { _id: 0 } },
    ])
      .limit(perPage)
      .skip(perPage * page);
  } else {
    return Book.aggregate([
      {
        $group: {
          _id: '$authorId',
          authorId: { $first: '$authorId' },
          averagePageCount: { $avg: '$pageCount' },
          numBooks: { $sum: 1 },
          titles: { $push: '$title' },
        },
      },

      { $project: { _id: 0 } },
    ])
      .limit(perPage)
      .skip(perPage * page);
  }
};
class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
