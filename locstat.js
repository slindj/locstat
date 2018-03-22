#!/usr/bin/env node

const Geodesy = require('geodesy')
const express = require('express')
const app = express()
const port = 3000;
//const sqlite3 = require('sqlite3').verbose();

var locstat_controller = require('./controllers/locstatController');

app.get('/locstat', locstat_controller.locstat_locate);
app.get('/list', locstat_controller.locstat_list);
app.get('/list_all',locstat_controller.locstat_list_all);
app.get('/active', locstat_controller.set_active);
app.get('/inactive', locstat_controller.set_inactive);

app.listen(port, (err) => {
  if (err) {
	  return console.log('something bad happened', err);
    
  }  
  console.log(`server is listening on ${port}`)
})


