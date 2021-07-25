//REFERRED TO LECTURE NOTES AND VIDEO

const { Router } = require("express");
const router = Router();
const mongoose = require("mongoose");

const bookDAO = require('../daos/book');

// Create
//given
//added try/catch
//added another else if, which catches the error message
//error message states that ISBN 
router.post("/", async (req, res, next) => {
  const book = req.body;
  if (!book || JSON.stringify(book) === '{}' ) {
    res.status(400).send('book is required');
  }

  else {
    try {
      const savedBook = await bookDAO.create(book);
      res.json(savedBook); 
    }

    catch(e) {
      if (e instanceof bookDAO.BadDataError) {
        res.status(400).send(e.message);
        next (e);
      }

      else if (e.message.includes("E11000 duplicate key error")) {
        res.status(400).send("Duplicate error.");
      }

      else {
        res.status(500).send(e.message);
        next (e);
      }
    }
  }
});

//Search
//calls DAO module searchQuery, which returns the search results
//added try/catch
router.get("/search", async (req, res, next) => {
  try {
    let { page, perPage, query } = req.query;
    page = page ? Number(page) : 0;
    perPage = perPage ? Number(perPage) : 10;
    const books = await bookDAO.searchQuery(page, perPage, query);
    res.json(books);
  }

  catch (e) {
    next(e);
  }
});


//getByAuthorId
//added try/catch
router.get("/", async (req, res, next) => {
  try {
    let { page, perPage, authorId } = req.query;
    page = page ? Number(page) : 0;
    perPage = perPage ? Number(perPage) : 10;

    //if an author id is used to search
    //calls DAO module getByAuthorID, which returns all books by searched author id
    if (authorId) {
      const books = await bookDAO.getByAuthorId(page, perPage, authorId);
      res.json(books);
    }
    //else if only a book is searched
    //calls DAO module getAll, which returns all books
    else {
      const books = await bookDAO.getAll(page, perPage);
      res.json(books);
    }
  } catch (e) {
    next(e);
  }
});

// Read - single book
//given
//added try/catch
router.get("/:id", async (req, res, next) => {
  try {
    const book = await bookDAO.getById(req.params.id);
    //if a book is used to search
    //calls DAO moduel getById, which returns a single book based on the id
    if (book) {
      res.json(book);
    } else {
      res.sendStatus(404);
    }
  }

  catch (e) {
    next(e);
  }
});

//getAuthorStat
//Similar format to given router code
//For this router, authorInfo is another parameter to get the author stats
router.get("/authors/stats", async (req, res, next) => {
  try {
    let { page, perPage, authorInfo } = req.query;
    page = page ? Number(page) : 0;
    perPage = perPage ? Number(perPage) : 10;
    const stats = await bookDAO.getAuthorStat(page, perPage, authorInfo);
    res.json(stats);
  }
  
  catch (e) {
    next(e);
  }
});

// Update
//given
router.put("/:id", async (req, res, next) => {
  const bookId = req.params.id;
  const book = req.body;
  if (!book || JSON.stringify(book) === '{}' ) {
    res.status(400).send('book is required"');
  }
  
  else {
    try {
      const success = await bookDAO.updateById(bookId, book);
      res.sendStatus(success ? 200 : 400); 
    }
    
    catch(e) {
      if (e instanceof bookDAO.BadDataError) {
        res.status(400).send(e.message);
        next(e);
      }
      
      else {
        res.status(500).send(e.message);
        next(e);
      }
    }
  }
});


// Delete
//given
router.delete("/:id", async (req, res, next) => {
  const bookId = req.params.id;
  try {
    const success = await bookDAO.deleteById(bookId);
    res.sendStatus(success ? 200 : 400);
  }
  
  catch(e) {
    res.status(500).send(e.message);
    next(e);
  }
});



module.exports = router;