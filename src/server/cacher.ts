import axios from 'axios';
const NodeCache = require('node-cache');

type Object = {
  [key: string]: any;
};

const myCache = new NodeCache({ stdTTL: 0 });
const db = require('../db/db-connect');
const newLifeTime = 60 * 15; // 15 minutes

// queries
const queries: Object = {
  baseline: `https://api.inaturalist.org/v1/observations/species_counts?place_id=122840&month=${process.env.BASELINE_MONTH}&lrank=species&hrank=species&per_page=1000`,
  previous: `https://api.inaturalist.org/v1/observations/species_counts?place_id=122840&d1=${process.env.PREVIOUS_D1}&d2=${process.env.PREVIOUS_D2}&lrank=species&hrank=species&per_page=500`,
  current: `https://api.inaturalist.org/v1/observations/species_counts?place_id=122840&d1=${process.env.CURRENT_D1}&d2=${process.env.CURRENT_D2}&lrank=species&hrank=species&per_page=500`,
};

// make query function
const makeQuery = async (type: string) => {
  console.log(`entered makequery for ${type} query`);
  console.log(queries[type]);
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
      console.log('iNat query complete');
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
    console.log(key, 'already in cache!');
    returnVal = keyVal;
  }
  // if not in cache, set value and return that
  else {
    console.log(key, 'not in cache.');

    let lifeTime;

    if (key === 'baseline' || key === 'previous') {
      returnVal = await db.query(`SELECT * FROM ${key};`);
      returnVal = returnVal.rows;
    } else if (key === 'current') {
      returnVal = await makeQuery(key);
      lifeTime = newLifeTime;
    }
    console.log(`Updated ${key} in cache with ${returnVal.length} records`);
    myCache.set(key, returnVal, lifeTime);
  }
  // get time left on current's cache
  let timeOfExpiry = myCache.getTtl('current');
  const timeRemaining = (timeOfExpiry - +new Date()) / 1000;

  return { returnVal, timeRemaining };
};

myCache.on('expired', (key: string, value: any) => {
  console.log(key, ' expired! ', new Date().toLocaleString());
});

module.exports = { checkCache, makeQuery };
