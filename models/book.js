//REFERRED TO LECTURE NOTES AND VIDEO

const mongoose = require('mongoose');

const Author = require('./author');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String },
  ISBN: { type: String, required: true, unique: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: Author, required: true, index: true },
  blurb: { type: String },
  publicationYear: { type: Number, required: true },
  pageCount: { type: Number, required: true }
});

//From lecture video
//Implenting a text search for title, genre, and blurb
//An index allows Mongo to make quicker scans, instead of scanning every single document
bookSchema.index({ title: 'text', genre: 'text', blurb: 'text' });

module.exports = mongoose.model("books", bookSchema);