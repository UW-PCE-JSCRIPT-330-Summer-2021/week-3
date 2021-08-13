const mongoose = require("mongoose");

const Author = require("./author");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String },
  ISBN: { type: String, required: true },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Author,
    required: true,
  },
  ISBN: { type: String, required: true, unique: true },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Author,
    required: true,
    index: true,
  },
  blurb: { type: String },
  publicationYear: { type: Number, required: true },
  pageCount: { type: Number, required: true },
});

bookSchema.index({ title: "text", genre: "text", blurb: "text" });

module.exports = mongoose.model("books", bookSchema);
