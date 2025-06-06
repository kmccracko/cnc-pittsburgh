// Require Modules
require('dotenv').config();
import express, { Request, Response, NextFunction } from 'express';
import debug from '../../betterDebug';
import morgan from 'morgan';

const dbg = debug(`cncpgh:server`);

const path = require('path');
const cors = require('cors');
const { checkEnv } = require('../db/db-init.ts');
const { clearCache } = require('./cacher');

// TYPES
type ServerError = {};

// Import Controllers
const inatController = require('./inat-api-controller');
//create app instance and other const variables
const app = express();
app.use(cors());

// run this for all requests, for cleaner log-reading
app.use(morgan('dev', { stream: { write: (msg: any) => dbg(msg) } }));

app.use(express.static('dist'));

//handle parsing request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// used to repopulate DB without touching env
app.use('/db/fillDB/:id', (req: Request, res: Response) => {
  if (req.params.id === process.env.DEV_KEY) {
    dbg('ACCESS GRANTED TO: ', req.params.id);
    checkEnv('force');
    clearCache('all');
    return res.status(201).send('ACCESS GRANTED & cache cleared');
  } else {
    dbg('Bad dev key: ', req.params.id);
    return res.status(200).send('Bad dev key.');
  }
});

app.get('/db/clearcache/:cachetype', (req: Request, res: Response) => {
  try {
    const msg = clearCache(req.params.cachetype);
    return res.status(200).send(msg);
  } catch (error) {
    return res.status(400).send(`Error clearing cache for: ${req.params.cachetype}`);
  }
});

app.use('/assets', express.static('src/client/assets'));
app.use('/styles', express.static('src/client/styles'));

app.use(
  '/getObs/:userName',
  inatController.getBaseline,
  inatController.getUserCurrent,
  inatController.getPrevious,
  async (req: Request, res: Response) => {
    dbg(Object.keys(res.locals));
    return res.status(200).json({
      current: res.locals.current,
      baseline: res.locals.baseline,
      previous: res.locals.previous,
      timeRemaining: res.locals.timeRemaining,
    });
  }
);

app.use(
  '/getObs',
  inatController.getBaseline,
  inatController.getCurrent,
  inatController.getPrevious,
  async (req: Request, res: Response) => {
    dbg(Object.keys(res.locals));
    return res.status(200).json({
      current: res.locals.current,
      baseline: res.locals.baseline,
      previous: res.locals.previous,
      timeRemaining: res.locals.timeRemaining,
    });
  }
);

app.get('/histogram/:taxonId', inatController.getHistogram, (req, res) => {
  return res.status(200).json({
    histogram: res.locals.histogram,
  });
});

app.get('/getInfo', (req, res) => {
  return res.status(200).json({
    baselineMonth: process.env.BASELINE_MONTH,
    curD1: process.env.CURRENT_D1,
    curD2: process.env.CURRENT_D2,
    curEndDate: process.env.CURRENT_END,
    prevD1: process.env.PREVIOUS_D1,
    prevD2: process.env.PREVIOUS_D2,
    projectId: process.env.PROJECT_ID,
    previousProjectId: process.env.PREVIOUS_PROJECT_ID,
  });
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).sendFile(path.resolve(__dirname, '../../dist/index.html'));
});

//404 error
app.use('*', (req: Request, res: Response) => {
  dbg('Sending back from 404 route');
  return res.sendStatus(404);
});

//create global error handler
app.use((err: ServerError, req: Request, res: Response, next: NextFunction) => {
  dbg('Global Error Handler:');
  console.error(err);
  return res.status(400).json(err);
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, async () => {
  if (process.env.NODE_ENV === 'development') return;
  await checkEnv();
  dbg(`Server listening on port: ${PORT}`);
});
