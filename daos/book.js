//REFERRED TO LECTURE NOTES AND VIDEO

const mongoose = require('mongoose');

const Book = require('../models/book');

module.exports = {};

//given
module.exports.getAll = (page, perPage) => {
  return Book.find().limit(perPage).skip(perPage*page).lean();
}

//getByAuthorId
//this is to allow the user to search using author id
module.exports.getByAuthorId = (page, perPage, authorId) => {
  return Book.find({ authorId }).limit(perPage).skip(perPage*page).lean();
}

//given
module.exports.getById = (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return null;
  }
  return Book.findOne({ _id: bookId }).lean();
}

//given
module.exports.deleteById = async (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return false;
  }
  await Book.deleteOne({ _id: bookId });
  return true;
}

//given
module.exports.updateById = async (bookId, newObj) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return false;
  }
  await Book.updateOne({ _id: bookId }, newObj);
  return true;
}

//given
module.exports.create = async (bookData) => {
  try {
    const created = await Book.create(bookData);
    return created;
  } catch (e) {
    if (e.message.includes("validation failed")) {
      throw new BadDataError(e.message);
    }
    throw e;
  }
}

//search
//Syntax and example found from lecture slides
module.exports.searchQuery = (page, perPage, query) => {
  //if user searches
  if (query) {
    return Book.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(perPage)
      .skip(perPage*page)
      .lean();
  }
  else {
    return Book.find()
      .limit(perPage)
      .skip(perPage*page)
      .lean();
  }
}

//getAuthorStat
//Using aggregation
//Aggregation allows for more advanced queries than find
//Order matters (pipeline)
//$group groups together the authorId, author, pagecount, number of books, and titles
//into 1 document
//$lookup allows a value to be taken from two documents much quicker
//$unwind takes an array field and generates a new parent document for each item in the array
//$project converts documents by renaming fields or leaving fields out
module.exports.getAuthorStat = (page, perPage, authorInfo) => {
  if (authorInfo) {
    return Book.aggregate([
      {
        $lookup: {
          from: "authors",
          localField: "authorId",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $group: {
          _id: "$authorId",
          author: { $first: "$author" },
          authorId: { $first: "$authorId" },
          averagePageCount: { $avg: "$pageCount" },
          numBooks: { $sum: 1 },
          titles: { $push: "$title" },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ])
      .limit(perPage)
      .skip(perPage*page);
  }
  else {
    return Book.aggregate([
      {
        $group: {
          _id: "$authorId",
          authorId: { $first: "$authorId" },
          averagePageCount: { $avg: "$pageCount" },
          numBooks: { $sum: 1 },
          titles: { $push: "$title" },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ])
      .limit(perPage)
      .skip(perPage*page);
  }
}

class BadDataError extends Error {};
module.exports.BadDataError = BadDataError;