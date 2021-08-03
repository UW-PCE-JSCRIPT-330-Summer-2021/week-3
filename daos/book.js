const { query } = require('express');
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
  let group = { $group: {
      _id: '$authorId', 
      titles: { $push: '$title' }, 
      numBooks: { $sum: 1 }, 
      averagePageCount: { $avg: '$pageCount' }
    }
  };
  let project = { $project: { 
    _id: 0, 
    author: 1,
    authorId: "$_id",
    averagePageCount: 1,
    numBooks: 1,
    titles: 1,
    }
  };

  let lookup;
  let query = [group, project];  

  if (authorInfo) {
    lookup = { $lookup: {
      from: 'authors',       
      localField: 'authorId',       
      foreignField: '_id',       
      as: 'author'}
    };
    query.push(lookup);
    query.push({ $unwind: '$author'});
  }
  return Book.aggregate(query);
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