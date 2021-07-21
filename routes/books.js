const { Router } = require("express");
const router = Router();
const mongoose = require("mongoose");

const bookDAO = require("../daos/book");

// Search
router.get("/search", async (req, res, next) => {
  try {
    // console.log("searching");
    let { page, perPage, query } = req.query;
    page = page ? Number(page) : 0;
    perPage = perPage ? Number(perPage) : 10;
    const books = await bookDAO.search(page, perPage, query);
    res.json(books);
  } catch (e) {
    next(e);
  }
});

// Create
router.post("/", async (req, res, next) => {
  const book = req.body;
  if (!book || JSON.stringify(book) === "{}") {
    res.status(400).send("book is required");
  } else {
    try {
      const savedBook = await bookDAO.create(book);
      res.json(savedBook);
    } catch (e) {
      if (e instanceof bookDAO.BadDataError) {
        res.status(400).send(e.message);
      } else if (e.message.includes("E11000")) {
        res.status(400).send("The ISBN already exists");
      } else {
        res.status(500).send(e.message);
      }
    }
  }
});

// Get
router.get("/", async (req, res, next) => {
  try {
    let { page, perPage, authorId } = req.query;
    page = page ? Number(page) : 0;
    perPage = perPage ? Number(perPage) : 10;
    if (authorId) {
      const books = await bookDAO.getAllFromAuthorId(page, perPage, authorId);
      res.json(books);
    } else {
      const books = await bookDAO.getAll(page, perPage);
      res.json(books);
    }
  } catch (e) {
    next(e);
  }
});

// Get by ID
router.get("/:id", async (req, res, next) => {
  const book = await bookDAO.getById(req.params.id);
  if (book) {
    res.json(book);
  } else {
    res.sendStatus(404);
  }
});

// Author Stats
router.get("/authors/stats", async (req, res, next) => {
  try {
    let { page, perPage, authorInfo } = req.query;
    page = page ? Number(page) : 0;
    perPage = perPage ? Number(perPage) : 10;
    const stats = await bookDAO.authorStats(page, perPage, authorInfo);
    res.json(stats);
  } catch (e) {
    next(e);
  }
});

// Update
router.put("/:id", async (req, res, next) => {
  const bookId = req.params.id;
  const book = req.body;
  if (!book || JSON.stringify(book) === "{}") {
    res.status(400).send('book is required"');
  } else {
    try {
      const success = await bookDAO.updateById(bookId, book);
      res.sendStatus(success ? 200 : 400);
    } catch (e) {
      if (e instanceof bookDAO.BadDataError) {
        res.status(400).send(e.message);
      } else {
        res.status(500).send(e.message);
      }
    }
  }
});

// Delete
router.delete("/:id", async (req, res, next) => {
  const bookId = req.params.id;
  try {
    const success = await bookDAO.deleteById(bookId);
    res.sendStatus(success ? 200 : 400);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
