'use strict';

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const superagent = require('superagent');




const server = express();
server.use(cors());

server.set('view engine','ejs');
const PORT = process.env.PORT || 3010;


server.get('/',(req,res)=>{
  res.send('HOME');
});


server.get('/hello',(req,res)=>{
  res.render('./pages/index.ejs');
});

server.listen(PORT , ()=>{
  console.log(`listening on PORT ${PORT}`);
});
