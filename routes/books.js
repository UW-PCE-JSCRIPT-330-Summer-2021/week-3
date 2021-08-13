const { Router } = require("express");
const router = Router();

const bookDAO = require("../daos/book");
// Create
router.post("/", async (req, res, next) => {
  const book = req.body;
  // console.log(req.params);
  if (!book || JSON.stringify(book) === "{}") {
    res.status(400).send("book is required");
  } else if (await bookDAO.getByIsbn({ ...book }.ISBN)) {
    res.status(400).send("ISBN already exists");
  } else {
    try {
      const savedBook = await bookDAO.create(book);
      res.json(savedBook);
    } catch (e) {
      if (e instanceof bookDAO.BadDataError) {
        res.status(400).send(e.message);
      } else {
        console.log(e);
        res.status(500).send(e.message);
      }
    }
  }
});

router.get("/search", async (req, res, next) => {
  let { page, perPage, query } = req.query;
  page = page ? Number(page) : 0;
  perPage = perPage ? Number(perPage) : 10;

  const books = await bookDAO.search(query, page, perPage);
  res.json(books);
});

router.get("/authors/stats", async (req, res, next) => {
  const includeAuthorInfo = !!req.query.authorInfo;
  let { page, perPage, query } = req.query;
  page = page ? Number(page) : 0;
  perPage = perPage ? Number(perPage) : 10;

  const result = await bookDAO.getStatusByAuthorId(
    includeAuthorInfo,
    page,
    perPage
  );
  res.json(result);
});

// Read - single book
router.get("/:id", async (req, res, next) => {
  const book = await bookDAO.getById(req.params.id);
  if (book) {
    res.json(book);
  } else {
    res.sendStatus(404);
  }
});

// Read - all books
router.get("/", async (req, res, next) => {
  try {
    let { page, perPage } = req.query;
    page = page ? Number(page) : 0;
    perPage = perPage ? Number(perPage) : 10;
    const books = await bookDAO.getAll(page, perPage, req.query);
    res.json(books);
  } catch (e) {
    console.log(e);
    if (e instanceof bookDAO.BadDataError) {
      res.status(400).send(e.message);
    } else {
      res.status(500).send(e.message);
    }
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
