// Require Modules
require('dotenv').config();
import express, { Request, Response, NextFunction } from 'express';
const path = require('path');
const cors = require('cors');
const { checkEnv, initializeDataTable } = require('../db/db-init.ts');

// TYPES
type ServerError = {};

// Import Controllers
const inatController = require('./inat-api-controller');
//create app instance and other const variables
const app = express();
app.use(cors());

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

// for use only when updating baseline data
app.use('/db/fillBaseline', (req: Request, res: Response) => {
  checkEnv('skip');
  return res.sendStatus(201);
});

app.use('/assets', express.static('src/client/assets'));
app.use('/styles', express.static('src/client/styles'));

app.use(
  '/getObs',
  inatController.getBaseline,
  inatController.getCurrent,
  inatController.getPrevious,
  async (req: Request, res: Response) => {
    console.log(Object.keys(res.locals));
    return res.status(200).json({
      current: res.locals.current,
      baseline: res.locals.baseline,
      previous: res.locals.previous,
      timeRemaining: res.locals.timeRemaining,
      queryInfo: {
        baselineMonth: process.env.BASELINE_MONTH,
        curD1: process.env.CURRENT_D1,
        curD2: process.env.CURRENT_D2,
        prevD1: process.env.PREVIOUS_D1,
        prevD2: process.env.PREVIOUS_D2,
      },
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

const PORT = process.env.PORT || 3003;
app.listen(PORT, async () => {
  await checkEnv();
  console.log(`Server listening on port: ${PORT}`);
});
