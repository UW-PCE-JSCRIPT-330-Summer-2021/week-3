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
      } else {
        res.status(500).send(e.message);
      }
    }
  }
});

// Read - single book
router.get("/:id", async (req, res, next) => {
 if("search === req.params.id"){
   const result= await bookDAO.getByQuery(req.query.query);
   if(result){
     res.json(result);
     return;
   }
 }
 const book = await bookDAO.getById(req.params.id);
 if(book){
   res.json(book);
  } else {
    res.sendStatus(404);
  }
});
router.get("/", async (req, res, next) =>{
  let{page, perPage, authorId}= req.query;
  if(authorId){
    const BooksForAuthor = await bookDAO.getAllBooksForAuthor(authorId);
    res.json(BooksForAuthor);
  }else{
    page = page? Number(page): 0;
    perPage =perPage? Number(perPage): 10;
    const books =await bookDAO.getAll(page, perPage);
    res.json(books);
  }
})
// Read - all books
router.get("/authors/stats", async (req, res, next) => {  
  let info = false;
  authorInfo = req.query.authorInfo;
  if(authorInfo){
    info = true; 
  }
  const stats = await bookDAO.getAuthorStats(info);
  res.json(stats);
});

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