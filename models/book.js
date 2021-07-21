//REFERRED BACK TO LECTURE VIDEO FOR LECTURE EXAMPLES
//TO IMPLEMENT AN INDEX

const mongoose = require('mongoose');

const Author = require('./author');

//name of book schema
//ISBN of the books is UNIQUE (unique: true), we don't want repeats of ISBN numbers
//Uniqueness allows Mongo to quickly detect conflicts
//Protects against duplicates automatically
//AuthorId index is set to true to access the connection with Author much faster, to get results
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String },
  ISBN: { type: String, required: true, unique: true},
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: Author, required: true, index: true },
  blurb: { type: String },
  publicationYear: { type: Number, required: true },
  pageCount: { type: Number, required: true }
});

//Index of the book that supports text search
//Defines indexes of the book schema
//Title is a text, genre is a text, the blurb is a text
bookSchema.index({ title: 'text', genre: 'text', blurb: 'text'})

module.exports = mongoose.model("books", bookSchema);