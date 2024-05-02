import axios from 'axios';
import debug from '../../betterDebug';
const NodeCache = require('node-cache');
const dbg = debug(`cncpgh:cache`);

type Object = {
  [key: string]: any;
};

const myCache = new NodeCache({ stdTTL: 0 });
const db = require('../db/db-connect');
const newLifeTime = 60 * 15; // 15 minutes

const challenge = process.env.PROJECT_ID
  ? `project_id=${process.env.PROJECT_ID}`
  : 'place_id=122840';

// queries
const queries: Object = {
  baseline: `https://api.inaturalist.org/v1/observations/species_counts?place_id=122840&month=${process.env.BASELINE_MONTH}&lrank=species&hrank=species&per_page=1000`,
  previous: `https://api.inaturalist.org/v1/observations/species_counts?${'place_id=122840'}&d1=${
    process.env.PREVIOUS_D1
  }&d2=${process.env.PREVIOUS_D2}&lrank=species&hrank=species&per_page=500`,
  current: `https://api.inaturalist.org/v1/observations/species_counts?${challenge}&d1=${process.env.CURRENT_D1}&d2=${process.env.CURRENT_D2}&lrank=species&hrank=species&per_page=500`,
};

// make query function
const makeQuery = async (type: string) => {
  const dbg = debug(`cncpgh:makeQuery`);
  dbg(`entered makequery for ${type} query`);
  dbg(queries[type]);
  const getNextPage: Function = async (page = 1, fullResult: Object[] = []) => {
    // make query
    const result = await axios.get(`${queries[type]}&page=${page}`);

    // update array
    fullResult.push(
      ...result.data.results.map((el: Object) => {
        return {
          name: el.taxon.preferred_common_name || el.taxon.name,
          scientificname: el.taxon.name,
          count: el.count,
          taxaId: String(el.taxon.id),
          pictureurl: el.taxon.default_photo
            ? el.taxon.default_photo.medium_url
            : null,
          taxon: el.taxon.iconic_taxon_name,
        };
      })
    );

    // recurse if there's more, else return array
    if (result.data.total_results > result.data.per_page * page) {
      return getNextPage(page + 1, fullResult);
    } else {
      dbg('iNat query complete');
      return fullResult;
    }
  };
  const parsedResults = await getNextPage();
  return parsedResults;
};

// check cache function
const checkCache = async (key: string) => {
  // check for string in cache
  const keyVal = myCache.get(key);
  let returnVal;
  // if in cache, return value
  if (keyVal) {
    dbg(`"${key}" already in cache!`);
    returnVal = keyVal;
  }
  // if not in cache, set value and return that
  else {
    dbg(`"${key}" not in cache.`);

    let lifeTime;

    if (key === 'baseline' || key === 'previous') {
      returnVal = await db.query(`SELECT * FROM ${key};`);
      returnVal = returnVal.rows;
    } else if (key === 'current') {
      // If within challenge dates, make current query. Otherwise, pull from DB
      if (
        +new Date(process.env.CURRENT_D1) < +new Date() &&
        +new Date() < +new Date(process.env.CURRENT_END)
      ) {
        returnVal = await makeQuery(key);
        lifeTime = newLifeTime;
      } else {
        returnVal = await db.query(`SELECT * FROM ${key};`);
        returnVal = returnVal.rows;
      }
    }
    dbg(`Updated "${key}" in cache with ${returnVal.length} records`);
    myCache.set(key, returnVal, lifeTime);
  }
  // get time left on current's cache
  let timeOfExpiry = myCache.getTtl('current');
  const timeRemaining = !timeOfExpiry ? 0 : (timeOfExpiry - +new Date()) / 1000;

  dbg({ timeOfExpiry, timeRemaining });
  return { returnVal, timeRemaining };
};

myCache.on('expired', (key: string, value: any) => {
  dbg(`${key} expired! ${new Date().toLocaleString()}`);
});

module.exports = { checkCache, makeQuery };
