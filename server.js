'use strict';

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');

// const pg = require('pg');
// const client = new pg.Client(process.env.DATABASE_URL);


const server = express();
server.use(cors());
server.use(express.static('./public'));

server.use(express.urlencoded({ extended: true }));
server.set('view engine','ejs');
const PORT = process.env.PORT || 3010;


// server.get('/',homeHandler);
server.get('/',(req,res)=>{
  res.render('./pages/index');
});

server.get('/hello',(req,res)=>{
  res.render('./pages/index');
});

server.get('/searches/new',(req,res)=>{
  res.render('./pages/searches/new');
});



server.post('/searches',searchHandler);


// function homeHandler(req,res){
//   let SQL = `SELECT * FROM booktable;`;
//   client.query(SQL)
//     .then(results=>{
//       res.render('index',{booksResults:results.rows});
//     })
//     .catch((err)=>{
//       res.send(err);
//     });

// }



function searchHandler(req,res){

  let search = req.body.search;

  let url = `https://www.googleapis.com/books/v1/volumes?q=${search}+intitle`;
  if (req.body.radio === 'author') {
    url = `https://www.googleapis.com/books/v1/volumes?q=${search}+inauthor`;
  }
  superagent.get(url)
    .then(bookData => {
      console.log(bookData);
      let bookArr = bookData.body.items.map(value => new Book(value));
      res.render('./pages/searches/show.ejs', { books: bookArr });
    })

    .catch((err)=>{
      res.send(err);
    });
}

server.get('*', (req, res) => {
  res.render('pages/404');
});


function Book(data) {
  this.title = data.volumeInfo.title;
  this.authors = data.volumeInfo.authors || `Author name is missing`;
  this.description = data.volumeInfo.description || `There is No description`;
  this.img = data.volumeInfo.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`;
}

server.listen(PORT , ()=>{
  console.log(`listening on PORT ${PORT}`);
});

// client.connect()
//   .then(() => {
//     server.listen(PORT, () =>{
//       console.log(`listening on ${PORT}`);
//     });

//   });
