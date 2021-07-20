const { Router, query } = require('express');
const router = Router();

const bookDAO = require('../daos/book');

// Create
router.post('/', async (req, res, next) => {
  const ISBN = req.body.ISBN;
  console.log(ISBN);
  const selectedBook = await bookDAO.getByisbnId(ISBN);
  console.log(selectedBook);
  if (selectedBook) {
    console.log('Sending 400 ISBN found ');
    return res.sendStatus(400);
  } else {
    const book = req.body;
    if (!book || JSON.stringify(book) === '{}') {
      res.status(400).send('book is required');
    } else {
      try {
        const savedBook = await bookDAO.create(book);
        res.json(savedBook);
      } catch (e) {
        if (e instanceof bookDAO.BadDataError) {
          res.status(400).send(e.message);
        } else {
          res.status(500).send(e.message);
        }
      }
    }
  }
});

router.get('/search', async (req, res, next) => {
  console.log('on the get  /search  ');
  try {
    let { page, perPage, query } = req.query;
    console.log(query);
    page = page ? Number(page) : 0;
    perPage = perPage ? Number(perPage) : 10;
    const books = await bookDAO.search(page, perPage, query);
    res.json(books);
  } catch (e) {
    next(e);
  }
});
// Read - single book
router.get('/:id', async (req, res, next) => {
  const book = await bookDAO.getById(req.params.id);
  if (book) {
    res.json(book);
  } else {
    res.sendStatus(404);
  }
});

// Read - all books
router.get('/', async (req, res, next) => {
  const authorId = req.query.authorId;
  console.log(authorId);
  let books;
  // get can retrive all or using query tetrive by tittle search

  if (authorId && authorId.length > 0) {
    let { page, perPage } = req.query;
    page = page ? Number(page) : 0;
    perPage = perPage ? Number(perPage) : 10;
    //const books = await bookDAO.getAll(page, perPage);
    console.log('on get book by authorid');
    books = await bookDAO.getAllByAuthor(authorId, page, perPage);
  } else {
    let { page, perPage, query } = req.query;
    page = page ? Number(page) : 0;
    perPage = perPage ? Number(perPage) : 10;
    console.log('on get all book ');
    books = await bookDAO.getAll(page, perPage, query);
  }
  res.json(books);
});

// Update
router.put('/:id', async (req, res, next) => {
  const bookId = req.params.id;
  const book = req.body;
  if (!book || JSON.stringify(book) === '{}') {
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
router.delete('/:id', async (req, res, next) => {
  const bookId = req.params.id;
  try {
    const success = await bookDAO.deleteById(bookId);
    res.sendStatus(success ? 200 : 400);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get('/authors/stats', async (req, res, next) => {
  // const authorInfo = !!req.query.AuthorInfo;
  try {
    let { page, perPage, authorInfo } = req.query;
    page = page ? Number(page) : 0;
    perPage = perPage ? Number(perPage) : 10;
    const resauthorinf = await bookDAO.getauthorstats(
      page,
      perPage,
      authorInfo
    );
    res.json(resauthorinf);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
