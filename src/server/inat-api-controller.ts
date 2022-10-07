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
  // check cache or update cache, then return value
  const { returnVal, timeRemaining } = await checkCache('current');
  res.locals.current = returnVal;
  res.locals.timeRemaining = timeRemaining;
  return next();
};

inat.getBaseline = async (req: Request, res: Response, next: NextFunction) => {
  // check cache or update cache, then return value
  const { returnVal, timeRemaining } = await checkCache('baseline');
  res.locals.baseline = returnVal;
  res.locals.timeRemaining = timeRemaining;
  return next();
};

module.exports = inat;
