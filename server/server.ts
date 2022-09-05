// Require Modules
const express = require('express');
const path = require('path');
const cors = require('cors');
// const cookieParser = require('cookie-parser');
require('dotenv').config();
// Import Controllers
const inatController = require('./inat-api-controller');
// connect to DB
//create app instance and other const variables
const app = express();

// run this for all requests, for cleaner log-reading
app.use((req, res, next) => {
  console.log(`${'-'.repeat(60)} a request has come in! ${'-'.repeat(60)}`);
  console.log(`${'-'.repeat(60)} source: ${req.url}`);
  next();
});

//use cors
app.use(cors());
//handle parsing request body
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  console.log('trying to send at /');
  return res.sendStatus(200);
  // res.status(201).sendFile(path.resolve(__dirname, '../dist/index.html'));
});

//404 error
app.use('/*', (req, res) => {
  console.log('trying to send back app from 404 route');
  return res.sendStatus(404);
  // res.status(206).sendFile(path.resolve(__dirname, '../dist/index.html'));
});

//create global error handler
app.use((err, req, res, next) => {
  console.log(err);
  console.log('in global err handler');
  const defaultErr = {
    log: 'Caught unknown middleware error',
    staus: 500,
    message: { err: 'An error occured' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(3000, () => {
  console.log(`Server listening on port: 3000`);
});
