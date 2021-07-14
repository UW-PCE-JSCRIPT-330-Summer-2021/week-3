const { Router } = require("express");
const router = Router();

const authorDAO = require('../daos/author');

// Create
router.post("/", async (req, res, next) => {
  const author = req.body;
  if (!author || JSON.stringify(author) === '{}' ) {
    res.status(400).send('author is required');
  } else {
    try {
      const savedAuthor = await authorDAO.create(author);
      res.json(savedAuthor); 
    } catch(e) {
      if (e instanceof authorDAO.BadDataError) {
        res.status(400).send(e.message);
      } else {
        res.status(500).send(e.message);
      }
    }
  }
});

router.get("/stats", async (req, res, next) => {
  const author = await authorDAO.getById(req.params.id);
  if (author) {
    res.json(author);
  } else {
    res.sendStatus(404);
  }
});

// Read - single author
router.get("/:id", async (req, res, next) => {
  const author = await authorDAO.getById(req.params.id);
  if (author) {
    res.json(author);
  } else {
    res.sendStatus(404);
  }
});

// Read - all authors
router.get("/", async (req, res, next) => {
  let { page, perPage } = req.query;
  page = page ? Number(page) : 0;
  perPage = perPage ? Number(perPage) : 10;
  const authors = await authorDAO.getAll(page, perPage);
  res.json(authors);
});

// Update
router.put("/:id", async (req, res, next) => {
  const authorId = req.params.id;
  const author = req.body;
  if (!author || JSON.stringify(author) === '{}' ) {
    res.status(400).send('author is required"');
  } else {
    try {
      const success = await authorDAO.updateById(authorId, author);
      res.sendStatus(success ? 200 : 400); 
    } catch(e) {
      if (e instanceof authorDAO.BadDataError) {
        res.status(400).send(e.message);
      } else {
        res.status(500).send(e.message);
      }
    }
  }
});

// Delete
router.delete("/:id", async (req, res, next) => {
  const authorId = req.params.id;
  try {
    const success = await authorDAO.deleteById(authorId);
    res.sendStatus(success ? 200 : 400);
  } catch(e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;