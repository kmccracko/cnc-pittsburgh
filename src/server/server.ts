// Require Modules
import express, { Request, Response, NextFunction } from 'express';
const path = require('path');

// TYPES
type ServerError = {};
type Object = {
  [key: string]: any;
};

// const cookieParser = require('cookie-parser');
require('dotenv').config();
// Import Controllers
const inatController = require('./inat-api-controller');
//create app instance and other const variables
const app = express();

// run this for all requests, for cleaner log-reading
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${'-'.repeat(20)} a request has come in! ${'-'.repeat(20)}`);
  console.log(`${'-'.repeat(20)} source: ${req.url}`);
  next();
});

app.use(express.static('dist'));

//handle parsing request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* for use only when updating baseline data
const {initializeDB} = require('../db/db-init.ts');
app.use('/db/fillBaseline', (req: Request, res: Response) => {
  console.log('test from server');
  initializeDB();
  return res.sendStatus(201);
});
*/

app.use(
  '/getObs',
  inatController.getBaseline,
  inatController.getCurrent,
  inatController.getMissing,
  (req: Request, res: Response) => {
    console.log(Object.keys(res.locals));
    return res.status(200).json({
      taxaArrays: res.locals.taxaArrays,
      fullArray: res.locals.fullArray,
    });
  }
);

app.get('/', (req: Request, res: Response) => {
  res.status(200).sendFile(path.resolve(__dirname, '../../dist/index.html'));
});

//404 error
app.use('*', (req: Request, res: Response) => {
  console.log('sending back from 404 route');
  return res.sendStatus(404);
  // res.status(206).sendFile(path.resolve(__dirname, '../dist/index.html'));
});

//create global error handler
app.use((err: ServerError, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  console.log('in global err handler');
  // const defaultErr = {
  //   log: 'Caught unknown middleware error',
  //   staus: 500,
  //   message: { err: 'An error occured' },
  // };
  // const errorObj = Object.assign({}, defaultErr, err);
  return res.status(400).json(err);
});

app.listen(3003, () => {
  console.log(`Server listening on port: 3003`);
});
