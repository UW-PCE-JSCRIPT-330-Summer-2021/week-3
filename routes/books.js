const { Router } = require("express");
const router = Router();

const bookDAO = require('../daos/book');

// Create
router.post("/", async (req, res, next) => {
  const book = req.body;
  // console.log(req.params);
  if (!book || JSON.stringify(book) === '{}' ) {
    res.status(400).send('book is required');
  } else if (await bookDAO.getByIsbn({...book}.ISBN)){
    res.status(400).send("ISBN already exists");
  } else {
    try {
      const savedBook = await bookDAO.create(book);
      res.json(savedBook); 
    } catch(e) {
      if (e instanceof bookDAO.BadDataError) {
        res.status(400).send(e.message);
      } else {
        console.log(e);
        res.status(500).send(e.message);
      }
    }
  }
});

// Read - single book
router.get("/:id", async (req, res, next) => {
  // console.log(req.body)
  const book = await bookDAO.getById(req.params.id);
  if (book) {
    res.json(book);
  } else if (req.params.id == "search") {   
    try {
      let { page, perPage, query } = req.query;
      page = page ? Number(page) : 0;
      perPage = perPage ? Number(perPage) : 10;
      query = { $text: { $search: req.query.query } }; 
      const bookScore = { score: { $meta: "textScore" } };
      // const bookSort = { score: { $meta: "textScore" } };
      // console.log(query);
      const bookSearch = await bookDAO.getAll(page, perPage, query, bookScore, bookScore);
      res.json(bookSearch);
    }
    catch(e) {
      console.log(e);
      if (e instanceof bookDAO.BadDataError) {
        res.status(400).send(e.message);
      } else {
        res.status(500).send(e.message);
      }
    }
  } else {   
    res.sendStatus(404);
  }
});

// Read - all books
router.get("/", async (req, res, next) => {
  try {
    console.log(req.params);
    let { page, perPage } = req.query;
    page = page ? Number(page) : 0;
    perPage = perPage ? Number(perPage) : 10;
    const books = await bookDAO.getAll(page, perPage, req.query);
    res.json(books);
  }
  catch(e) {
    console.log(e);
    if (e instanceof bookDAO.BadDataError) {
      res.status(400).send(e.message);
    } else {
      res.status(500).send(e.message);
    }
    
  }
});

router.get("/authors/stats", async (req, res, next) => {
  try {
    let { authorInfo } = req.query;
    console.log(req.params.bookId);

    console.log(authorInfo);
    const authorStats = await bookDAO.getStats(authorInfo);
    res.json(authorStats );
  }
  catch(e) {
    console.log(e);
    if (e instanceof bookDAO.BadDataError) {
      res.status(400).send(e.message);
    } else {
      res.status(500).send(e.message);
    }
  }
});

// Search term
/* router.get("/:id/search", async (req, res, next) => {
  try {
    let { page, perPage, query } = req.query;
    page = page ? Number(page) : 0;
    perPage = perPage ? Number(perPage) : 10;
    query = {title: query};
    const books = await bookDAO.getAll(page, perPage, query);
    res.json(books);
  }
  catch(e) {
    console.log(e);
    if (e instanceof bookDAO.BadDataError) {
      res.status(400).send(e.message);
    } else {
      res.status(500).send(e.message);
    }
    
  }
}); */

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