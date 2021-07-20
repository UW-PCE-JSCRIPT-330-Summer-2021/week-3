const { Router } = require("express");
const router = Router();

const bookDAO = require('../daos/book');

// Create
router.post("/", async (req, res, next) => {
  const book = req.body;
  if (!book || JSON.stringify(book) === '{}' ) {
    res.status(400).send('book is required');
  } else {
    try {
      const savedBook = await bookDAO.create(book);
      res.json(savedBook); 
    } catch(e) {
      if (e instanceof bookDAO.BadDataError) {
        res.status(400).send(e.message);
        next (e);
      } else {
        res.status(500).send(e.message);
        next (e);
      }
    }
  }
});

// Read - search 
router.get("/search", async (req, res, next) => {
  try {
    let { page, perPage, query } = req.query;
    page = page ? Number(page) : 0;
    perPage = perPage ? Number(perPage) : 10;
    const books = await bookDAO.search(page, perPage, query);
    res.json(books);
  } catch (e) {
    next(e);
  }
});

// Read - single book
router.get("/:id", async (req, res, next) => {
  try {
    const book = await bookDAO.getById(req.params.id);
    if (book) {
      res.json(book);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e)
  }
});

// Read - all books
router.get("/", async (req, res, next) => {
  try {
    let { authorId, page, perPage } = req.query;
    page = page ? Number(page) : 0;
    perPage = perPage ? Number(perPage) : 10;
    const books = await bookDAO.getAll(authorId, page, perPage);
    res.json(books);
  } catch (e) {
    next(e)
  }
});

// Read - author stats 
router.get("/authors/stats", async (req, res, next) => {
  try {
    let { page, perPage, authorInfo } = req.query;
    page = page ? Number(page) : 0;
    perPage = perPage ? Number(perPage) : 10;
    const stats = await bookDAO.getStats(authorInfo, page, perPage);
    res.json(stats);
  } catch (e) {
    res.status(404).send('author ID required');
    next(e)
  }
})

// Update
router.put("/:id", async (req, res, next) => {
  const bookId = req.params.id;
  const book = req.body;
  if (!book || JSON.stringify(book) === '{}' ) {
    res.status(400).send('book is required"');
  } else {
    try {
      const success = await bookDAO.updateById(bookId, book);
      res.sendStatus(success ? 200 : 400); 
    } catch(e) {
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
  } catch(e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;