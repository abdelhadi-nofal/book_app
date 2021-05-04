'use strict';

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');

const pg = require('pg');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: process.env.DEV_MODE ? false : { rejectUnauthorized: false } });
const methodOverride = require('method-override');

const server = express();
server.use(cors());
server.use(express.static('./public'));

server.use(express.urlencoded({ extended: true }));
server.set('view engine','ejs');
server.use(methodOverride('_method'));
const PORT = process.env.PORT || 3010;


server.get('/',homeHandler);
server.get('/',(req,res)=>{
  res.render('./pages/index');
});

server.get('/hello',(req,res)=>{
  res.render('./pages/index');
});
server.get('/books/:bookID', bookDetails);
server.get('/searches/new',(req,res)=>{
  res.render('./pages/searches/new');
});
server.post('/books', addBookHandler);


server.post('/searches',searchHandler);
server.put('/updateBook/:bookID',updateBookHandler);

function homeHandler(req,res){
  let SQL = `SELECT * FROM booktable;`;
  client.query(SQL)
    .then(results=>{
      console.log(results.rows[0].img);
      res.render('pages/index',{booksResults:results.rows});
    })
    .catch((err)=>{
      res.send(err);
    });

}

function bookDetails(req, res) {
  let SQL = `SELECT * FROM booktable WHERE id=$1;`;
  let safeValue = [req.params.bookID];
  client.query(SQL,safeValue)
    .then(result => {
      res.render('pages/books/detail', { book: result.rows[0] });
    })
    .catch((err)=>{
      res.send(err);
    });
}


function searchHandler(req,res){

  let search = req.body.search;

  let url = `https://www.googleapis.com/books/v1/volumes?q=${search}+intitle`;
  if (req.body.radio === 'author') {
    url = `https://www.googleapis.com/books/v1/volumes?q=${search}+inauthor`;
  }
  superagent.get(url)
    .then(bookData => {
      // console.log(bookData);
      let bookArr = bookData.body.items.map(value => new Book(value));
      res.render('./pages/searches/show.ejs', { books: bookArr });
    })

    .catch((err)=>{
      res.send(err);
    });
}

function addBookHandler(req, res) {
  let SQL = `INSERT INTO booktable (title,author, description, img)
  VALUES($1,$2,$3,$4) RETURNING *;`;
  let values = [req.body.title, req.body.author, req.body.description, req.body.img];
  client.query(SQL, values)
    .then(result => {
      res.redirect(`/books/${result.rows[0].id}`);
    })
    .catch((err)=>{
      res.send(err);
    });
}

function updateBookHandler(req,res){
  console.log(req.body);
  let {title,description,author} = req.body;
  let SQL = `UPDATE booktable SET title=$1,author=$2,description=$3 WHERE id=$4;`;
  let safeValues = [title,author,description,req.params.bookID];
  client.query(SQL,safeValues)
    .then(()=>{
      res.redirect(`/books/${req.params.bookID}`);
    });
}

server.get('*', (req, res) => {
  res.render('pages/404');
});


function Book(data) {
  this.title = data.volumeInfo.title;
  this.authors = data.volumeInfo.authors || `Author name is missing`;
  this.description = data.volumeInfo.description || `There is No description`;
  // this.img = data.volumeInfo.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`;
  this.img = '';
  try {
    this.img = data.volumeInfo.imageLinks.thumbnail
  }
  catch {
    this.img = `https://i.imgur.com/J5LVHEL.jpg`;
  }
}

// server.listen(PORT , ()=>{
//   console.log(`listening on PORT ${PORT}`);
// });

client.connect()
  .then(() => {
    server.listen(PORT, () =>{
      console.log(`listening on ${PORT}`);
    });

  });
