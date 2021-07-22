  
const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');
const Authors = require('../models/author');
const Books = require('../models/book');

const { testAuthors } = require('./authors.test');

describe("/books", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);

  let savedAuthors;
  const testBooks = [
    {
      title: "The Handmaid's Tale",
      genre: "Dystopian",
      ISBN: "0-7710-0813-9",
      blurb: "Scary potential future",
      publicationYear: 1985,
      pageCount: 311
    },
    {
      title: "Alias Grace",
      genre: "Historical Fiction",
      ISBN: "0-7710-0835-X",
      blurb: "Something about murder",
      publicationYear: 1996,
      pageCount: 470
    },
    {
      title: "Go Tell It on the Mountain",
      genre: "Semi-autobiographical",
      ISBN: "0-440-33007-6",
      blurb: "Story about growing up in Harlem",
      publicationYear: 1953,
      pageCount: 272
    },
    {
      title: "Notes of a Native Son",
      genre: "Non-fiction",
      ISBN: "978-0-8070-0624-5",
      blurb: "Collection of Essays",
      publicationYear: 1955,
      pageCount: 165
    },
    {
      title: "If Beale Street Could Talk",
      genre: "Love Story",
      ISBN: "0-7181-1126-5",
      blurb: "Love story set in Harlem",
      publicationYear: 1974,
      pageCount: 197
    },
    {
      title: "The Fifth Season",
      genre: "Fantasy",
      ISBN: "978-0-356-50819-1",
      blurb: "Dystopian Future",
      publicationYear: 2015,
      pageCount: 512
    },
    {
      title: "The Obelisk Gate",
      genre: "Fantasy",
      ISBN: "978-0-356-50836-8",
      blurb: "Dystopian Future sequel",
      publicationYear: 2016,
      pageCount: 433
    },
    {
      title: "The Stone Sky",
      genre: "Fantasy",
      ISBN: "978-0-316-22924-1",
      blurb: "Dystopian future trilogy ending",
      publicationYear: 2017,
      pageCount: 464
    },
    {
      title: "Steelheart",
      genre: "Young Adult Fantasy",
      ISBN: "978-0385743563",
      blurb: "Dystopian superhero world",
      publicationYear: 2013,
      pageCount: 386
    },
    {
      title: "The Way of Kings",
      genre: "Epic Fantasy",
      ISBN: "978-0-7653-2635-5",
      blurb: "Sweeping fantasy in long series",
      publicationYear: 2010,
      pageCount: 1007
    },
  ];

  beforeEach(async () => {
    savedAuthors = await Authors.insertMany(testAuthors);
    savedAuthors = savedAuthors.map((author) => ({
      ...author.toObject(),
      _id: author._id.toString()
    }));

    // Atwood
    testBooks[0].authorId = savedAuthors[0]._id;
    testBooks[1].authorId = savedAuthors[0]._id;
    // Baldwin
    testBooks[2].authorId = savedAuthors[1]._id;
    testBooks[3].authorId = savedAuthors[1]._id;
    testBooks[4].authorId = savedAuthors[1]._id;
    // Jemesin
    testBooks[5].authorId = savedAuthors[2]._id;
    testBooks[6].authorId = savedAuthors[2]._id;
    testBooks[7].authorId = savedAuthors[2]._id;
    // Sanderson
    testBooks[8].authorId = savedAuthors[3]._id;
    testBooks[9].authorId = savedAuthors[3]._id;

    const savedBooks = await Books.insertMany(testBooks);
    testBooks.forEach((book, index) => {
      book._id = savedBooks[index]._id.toString();
    });
  });

  afterEach(testUtils.clearDB);

  describe("GET /", () => {
    it("should return all books", async () => {
      const res = await request(server).get("/books");
      expect(res.statusCode).toEqual(200);
      testBooks.forEach(book => {
        expect(res.body).toContainEqual(
          expect.objectContaining(book)
        )
      })
    });

    describe("with an authorId query parameter", () => {
      it("should return books just for that author", async () => {
        const authorId = savedAuthors[1]._id;
        const res = await request(server).get("/books?authorId=" + authorId);
        expect(res.statusCode).toEqual(200);
        const responseBooks = res.body;
        expect(responseBooks).toHaveLength(3);
        responseBooks.forEach(book => {
          expect(book.authorId).toEqual(authorId)
        });
      });

      it("should have an index that gets used", async () => {
        const indexes = await Books.collection.getIndexes({ full: true});
        expect(indexes).toContainEqual(
          expect.objectContaining({ key: { authorId: 1 }})
        )
      });
    });

    describe("GET /search", () => {
      it("should return one matching book", async () => {
        const searchTerm = 'Superhero'
        const res = await request(server).get("/books/search?query=" + encodeURI(searchTerm));
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([
          testBooks.find(book => book.title === 'Steelheart')
        ]);
      });
      it("should return two matching books sorted by best matching single term", async () => {
        const searchTerm = 'Harlem'
        const res = await request(server).get("/books/search?query=" + encodeURI(searchTerm));
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([
          testBooks.find(book => book.title === "Go Tell It on the Mountain"),
          testBooks.find(book => book.title === "If Beale Street Could Talk"),
        ]);
      });
      it("should return multipe matching books sorted by best mutliple terms", async () => {
        const searchTerm = 'Fantasy and Kings'
        const res = await request(server).get("/books/search?query=" + encodeURI(searchTerm));
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject([
          testBooks.find(book => book.title === 'The Way of Kings'),
          testBooks.find(book => book.title === 'The Fifth Season'),
          testBooks.find(book => book.title === 'The Obelisk Gate'), 
          testBooks.find(book => book.title === 'The Stone Sky'),
          testBooks.find(book => book.title === 'Steelheart'),
        ]);
      });
    });

    describe("/authors/stats", () => {
      it("should return stats by authorId", async () => {
        const res = await request(server).get("/books/authors/stats");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toContainEqual({
          authorId: savedAuthors[0]._id,
          averagePageCount: 390.5,
          numBooks: 2,
          titles: [testBooks[0].title, testBooks[1].title]
        });
        expect(res.body).toContainEqual({
          authorId: savedAuthors[1]._id,
          averagePageCount: 211 + 1/3,
          numBooks: 3,
          titles: [testBooks[2].title, testBooks[3].title, testBooks[4].title]
        });
        expect(res.body).toContainEqual({
          authorId: savedAuthors[2]._id,
          averagePageCount: 469 + 2/3,
          numBooks: 3,
          titles: [testBooks[5].title, testBooks[6].title, testBooks[7].title]
        });
        expect(res.body).toContainEqual({
          authorId: savedAuthors[3]._id,
          averagePageCount: 696.5,
          numBooks: 2,
          titles: [testBooks[8].title, testBooks[9].title]
        });
      });
      describe("with authorInfo=true", () => {
        it("should return stats by authorId with all author info", async () => {
          const res = await request(server).get("/books/authors/stats?authorInfo=true");
          expect(res.statusCode).toEqual(200);
          expect(res.body).toContainEqual({
            authorId: savedAuthors[0]._id,
            averagePageCount: 390.5,
            numBooks: 2,
            titles: [testBooks[0].title, testBooks[1].title],
            author: savedAuthors[0]
          });
          expect(res.body).toContainEqual({
            authorId: savedAuthors[1]._id,
            averagePageCount: 211 + 1/3,
            numBooks: 3,
            titles: [testBooks[2].title, testBooks[3].title, testBooks[4].title],
            author: savedAuthors[1]
          });
          expect(res.body).toContainEqual({
            authorId: savedAuthors[2]._id,
            averagePageCount: 469 + 2/3,
            numBooks: 3,
            titles: [testBooks[5].title, testBooks[6].title, testBooks[7].title],
            author: savedAuthors[2]
          });
          expect(res.body).toContainEqual({
            authorId: savedAuthors[3]._id,
            averagePageCount: 696.5,
            numBooks: 2,
            titles: [testBooks[8].title, testBooks[9].title],
            author: savedAuthors[3]
          });
        });
      });
    });
  });

  describe("GET /:id", () => {
    it("should return 404 if no matching id", async () => {
      const res = await request(server).get("/books/id1");
      expect(res.statusCode).toEqual(404);
    });

    it.each(testBooks)("should find book # %#", async (book) => {
      const res = await request(server).get("/books/" + book._id);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toMatchObject(book);
    })
  });

  describe("POST /", () => {
    it("should reject a book with an empty body", async () => {
      const book = {};
      const res = await request(server).post("/books").send(book);
      expect(res.statusCode).toEqual(400);
    });

    const fullBook = {
      title: "New Book",
      genre: "Whatever",
      ISBN: "111",
      blurb: "Description",
      publicationYear: 1985,
      pageCount: 100
    };
    it.each(["title", "ISBN", "authorId", "publicationYear", "pageCount"])
      ("should reject a book without a %s", async (fieldToRemove) => {
      const book = { ...fullBook, authorId: savedAuthors._id };
      delete book[fieldToRemove];
      const res = await request(server).post("/books").send(book);
      expect(res.statusCode).toEqual(400);
    });

    it("should reject a book with an existing ISBN", async () => {
      const book = { ...testBooks[4], title: 'Duplicate' };
      delete book._id;
      const res = await request(server).post("/books").send(book);
      const savedISBNBooks = await Books.find({ ISBN: book.ISBN });
      expect(savedISBNBooks).toHaveLength(1);
      expect(res.statusCode).toEqual(400);

    });

    it("should create a book", async () => {
      const book = { ...fullBook, authorId: savedAuthors[0]._id };
      const res = await request(server).post("/books").send(book);
      expect(res.statusCode).toEqual(200);
      const { _id } = res.body;
      const savedBook = await Books.findOne({ _id }).lean();
      savedBook.authorId = savedBook.authorId.toString();
      expect(savedBook).toMatchObject(book);
    });
  });

  describe("PUT /:id", () => {
    it("should reject a book with an empty body", async () => {
      const { _id } = testBooks[0];
      const res = await request(server).put("/books/" + _id).send({});
      expect(res.statusCode).toEqual(400);
    });

    it("should reject a bad id", async () => {
      const res = await request(server).put("/books/fake").send(testBooks[0]);
      expect(res.statusCode).toEqual(400);
    });

    it("should update a book", async () => {
      const originalBook = testBooks[1];
      const book = { ...originalBook };
      book.blurb = "New Blurb";
      const res = await request(server).put("/books/" + book._id).send(book);
      expect(res.statusCode).toEqual(200);
     
      const savedBook = await testUtils.findOne(Books, { _id: book._id });
      savedBook.authorId = savedBook.authorId.toString();
      expect(savedBook).toMatchObject(book);
    });
  });

  describe("DELETE /:id", () => {
    it("should reject a bad id", async () => {
      const res = await request(server).delete("/books/fake").send();
      expect(res.statusCode).toEqual(400);
    });
    
    it("should delete the expected book", async () => {
      const { _id } = testBooks[1];
      const res = await request(server).delete("/books/" + _id).send({});
      expect(res.statusCode).toEqual(200);
      const storedBook = await Books.findOne({ _id });
      expect(storedBook).toBeNull();
    });
  });
});