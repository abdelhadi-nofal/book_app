'use strict';

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');



const server = express();
server.use(cors());
server.use(express.static('./public'));

server.use(express.urlencoded({ extended: true }));
server.set('view engine','ejs');
const PORT = process.env.PORT || 3010;


server.get('/',(req,res)=>{
  res.send('HOME');
});


server.get('/hello',(req,res)=>{
  res.render('./pages/index.ejs');
});

server.get('/searches/new',(req,res)=>{
  res.render('./pages/searches/new.ejs');
});



server.post('/searches',searchHandler);


function searchHandler(req,res){

  let search = req.body.search;

  let url = `https://www.googleapis.com/books/v1/volumes?q=${search}+intitle`;
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


function Book(data) {
  this.title = data.volumeInfo.title;
  this.authors = data.volumeInfo.authors || `Author name is missing`;
  this.description = data.volumeInfo.description || `There is No description`;
  this.img = data.volumeInfo.imageLinks.thumbnail || `https://i.imgur.com/J5LVHEL.jpg`;
}

server.listen(PORT , ()=>{
  console.log(`listening on PORT ${PORT}`);
});
