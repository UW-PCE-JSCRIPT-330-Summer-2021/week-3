const mongoose = require('mongoose');

const Book = require('../models/book');

module.exports = {};

module.exports.getAll = (page, perPage) => {
  return Book.find().limit(perPage).skip(perPage * page).lean();
}
module.exports.getAllBooksForAuthor = (authorId) =>{
  if (!mongoose.Types.ObjectId.isValid(authorId)){
    return null;
  }
return Book.find({authorId: authorId}).lean();
}

module.exports.getById = (bookId) => {
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return null;
  }
  return Book.findOne({ _id: bookId }).lean();
}
module.exports.getByQuery = async (searchterm) => {
  const value = searchterm.split("and");
  let newReg = '';
  if(value.length > 1){
    const sorted = value.sort();
    newReg = new RegExp(sorted, 'i');
    const result = await Book.find(
      {$text: {$search:newReg}}
    ).sort({genre: 'asc', title: 'asc'});
    return result;
  }
  newReg = new RegExp(searchterm, 'i')
  return Book.find(
    {blurb:{$regex: newReg}}
  );
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
module.exports.getAuthorStats = async (info) => {

  if (info === true) {

    const result = await Book.aggregate([
      { $sort: { _id: -1 } },
      {
        $group: {
          _id: '$authorId',
          'numBooks': { "$sum": 1 },
          'averagePageCount': { '$avg': '$pageCount' },
          'titles': { $addToSet: '$title' }
        },
      },
      { $project: { _id: 0, authorId: "$_id", numBooks: 1, averagePageCount: 1, titles: 1 } },
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
      }
    ]);
    return result;

  } else {
    const result = await Book.aggregate([
      { $sort: { _id: -1 } },
      {
        $group: {
          _id: '$authorId',
          'numBooks': { "$sum": 1 },
          'averagePageCount': { '$avg': '$pageCount' },
          'titles': { $addToSet: '$title' }
        }
      },
      { $project: { _id: 0, authorId: "$_id", numBooks: 1, averagePageCount: 1, titles: 1 } }
    ]);
    return result;
  }

}


module.exports.create = async (bookData) => {
  try {
    const created = await Book.create(bookData);
    return created;
  } catch (e) {
    if (e.message.includes('validation failed')) {
      throw new BadDataError(e.message);
    }
    if(e.message.includes('duplicate key error dup key')){
      throw new BadDataError(e.message);
    }
    throw e;
  }
}

class BadDataError extends Error {};
module.exports.BadDataError = BadDataError;