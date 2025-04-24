import { Request, Response, NextFunction, RequestHandler } from 'express';
const { checkCache } = require('./cacher');

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
    res.locals.current = returnVal;
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

module.exports = inat;
