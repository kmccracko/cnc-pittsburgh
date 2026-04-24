import { Request, Response, NextFunction, RequestHandler } from 'express';
const { checkCache, enrichCurrentSpeciesData } = require('./cacher');
import debug from '../../betterDebug';
const dbg = debug(`cncpgh:inat-api-controller`);

type controller = {
  [key: string]: RequestHandler;
};

type Object = {
  [key: string]: any;
};

const inat: controller = {};

inat.getCurrent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // check cache or update cache, then return value
    const { returnVal, timeRemaining } = await checkCache('current');
    const { verifiedCurrent, visibleCelebrations } = await enrichCurrentSpeciesData(
      returnVal,
      res.locals.baseline
    );
    res.locals.current = verifiedCurrent;
    res.locals.newSpeciesCelebrations = visibleCelebrations;
    res.locals.timeRemaining = timeRemaining;
    return next();
  } catch (error) {
    return next(error);
  }
};

inat.getPrevious = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // check cache or update cache, then return value
    const { returnVal } = await checkCache('previous');
    res.locals.previous = returnVal;
    return next();
  } catch (error) {
    return next(error);
  }
};

inat.getBaseline = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // check cache or update cache, then return value
    const { returnVal } = await checkCache('baseline');
    res.locals.baseline = returnVal;
    return next();
  } catch (error) {
    return next(error);
  }
};

inat.getBaselineBroad = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // check cache or update cache, then return value
    const { returnVal } = await checkCache('baseline_broad');
    res.locals.baselineBroad = returnVal;
    return next();
  } catch (error) {
    return next(error);
  }
};

inat.getHistogram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taxonId = req.params.taxonId;
    
    // check cache or update cache, then return value
    const { returnVal } = await checkCache('histogram', { taxonId });
    
    res.locals.histogram = returnVal;
    return next();
  } catch (error) {
    return next(error);
  }
};

inat.getUserCurrent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userName = req.params.userName;
    
    // check cache or update cache, then return value
    const { returnVal, timeRemaining } = await checkCache('user', { userName });

    const { verifiedCurrent, visibleCelebrations } = await enrichCurrentSpeciesData(
      returnVal,
      res.locals.baseline
    );
    res.locals.current = verifiedCurrent;
    res.locals.newSpeciesCelebrations = visibleCelebrations;
    res.locals.timeRemaining = timeRemaining;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = inat;
