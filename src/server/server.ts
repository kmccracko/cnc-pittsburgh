// Require Modules
import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';
const path = require('path');
const cors = require('cors');

// TYPES
type ServerError = {};
type Object = {
  [key: string]: any;
};

// const cookieParser = require('cookie-parser');
require('dotenv').config();
// Import Controllers
const inatController = require('./inat-api-controller');
// connect to DB
//create app instance and other const variables
const app = express();

// run this for all requests, for cleaner log-reading
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${'-'.repeat(60)} a request has come in! ${'-'.repeat(60)}`);
  console.log(`${'-'.repeat(60)} source: ${req.url}`);
  next();
});

app.use(express.static(path.resolve(__dirname, '../client')));

//use cors
// app.use(cors());
//handle parsing request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  '/getObs',
  inatController.getObs0,
  inatController.getObs1,
  (req: Request, res: Response) => {
    // get current names only
    const curResNames = res.locals.data1.map((el: Object) => {
      return el.name;
    });

    // filter full list where current name exists
    const missingSpecies = res.locals.data0.filter((el: Object) => {
      return curResNames.indexOf(el.name) < 0;
    });

    // loop through full list, distribute each specie into taxa
    const taxaArrays = missingSpecies.reduce((obj: Object, specie: Object) => {
      if (obj[specie.taxon]) obj[specie.taxon].push(specie);
      else obj[specie.taxon] = [specie];
      return obj;
    }, {});

    // return "missing only" list
    return res.status(200).json({ taxaArrays, fullArray: missingSpecies });
  }
);

app.get('/', (req: Request, res: Response) => {
  console.log('trying to send at /');
  return res.sendStatus(200);
  // res.status(201).sendFile(path.resolve(__dirname, '../dist/index.html'));
});

//404 error
app.use('*', (req: Request, res: Response) => {
  console.log('trying to send back app from 404 route');
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
