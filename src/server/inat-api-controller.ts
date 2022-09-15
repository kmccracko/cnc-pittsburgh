import { Request, Response, NextFunction, RequestHandler } from 'express';
const checkCache = require('./cacher');

type controller = {
  [key: string]: Function;
};

type Object = {
  [key: string]: any;
};

const inat: controller = {};

inat.getCurrent = async (req: Request, res: Response, next: NextFunction) => {
  // check cache or update cache, then return value
  res.locals.current = await checkCache('current');
  return next();
};

inat.getBaseline = async (req: Request, res: Response, next: NextFunction) => {
  // check cache or update cache, then return value
  res.locals.baseline = await checkCache('baseline');
  return next();
};

inat.getMissing = async (req: Request, res: Response, next: NextFunction) => {
  // get current names only
  const curResNames = new Set([]);
  for (const el of res.locals.current) {
    curResNames.add(el.scientificName);
  }

  console.log(res.locals.baseline.length);
  // filter full list where current name exists
  const missingSpecies = res.locals.baseline.filter((el: Object) => {
    return !curResNames.has(el.scientificName);
  });
  console.log(missingSpecies.length);

  // loop through full list, distribute each specie into taxa
  const taxaArrays = missingSpecies.reduce((obj: Object, cur: Object) => {
    if (obj[cur.taxon]) obj[cur.taxon].push(cur);
    else obj[cur.taxon] = [cur];
    return obj;
  }, {});

  res.locals.taxaArrays = taxaArrays;
  res.locals.fullArray = missingSpecies;
  return next();
};

module.exports = inat;
