const NodeCache = require('node-cache');
import axios, { AxiosResponse } from 'axios';
type Object = {
  [key: string]: any;
};

const myCache = new NodeCache({ stdTTL: 0, checkperiod: 60 * 30 });
const db = require('../db/db-connect');

// queries
const queries: Object = {
  baseline: `https://api.inaturalist.org/v1/observations/species_counts?place_id=122840&month=4%2C5&per_page=1000`,
  current: `https://api.inaturalist.org/v1/observations/species_counts?place_id=122840&d1=2022-04-28&d2=2022-05-02&per_page=500`,
};

// make query function
const makeQuery = async (type: string) => {
  console.log('entered makequery');
  const getNextPage: Function = async (page = 1, fullResult: Object[] = []) => {
    // make query
    const result = await axios.get(`${queries[type]}&page=${page}`);

    // show progress
    console.log('total results: ', result.data.total_results);
    console.log('page: ', page);

    // update array
    fullResult.push(
      ...result.data.results.map((el: Object) => {
        return {
          name: el.taxon.preferred_common_name,
          scientificname: el.taxon.name,
          count: el.count,
          taxaid: el.taxon.id,
          pictureurl: el.taxon.default_photo
            ? el.taxon.default_photo.medium_url
            : null,
          taxon: el.taxon.iconic_taxon_name,
        };
      })
    );
    console.log('full length: ', fullResult.length);

    // recurse if there's more, else return array
    if (result.data.total_results > result.data.per_page * page) {
      return getNextPage(page + 1, fullResult);
    } else {
      return fullResult;
    }
  };
  const parsedResults = await getNextPage();
  return parsedResults;
};

// check cache function
const checkCache = async (key: string) => {
  console.log(myCache.keys());
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
    console.log(key, 'not in cache. about to create a key');

    let newData;
    let lifeTime;

    if (key === 'baseline') {
      newData = await db.query('select * from baseline;');
      newData = newData.rows;
      lifeTime = undefined;
      returnVal = newData;
    }
    if (key === 'current') {
      newData = await makeQuery(key);
      lifeTime = 60 * 30;
      returnVal = newData;
    }
    myCache.set(key, newData, lifeTime); // 3 mins
  }
  return returnVal;
};

myCache.on('expired', (key: string, value: any) => {
  console.log(
    key,
    ' expired! about to replace it - ',
    new Date().toLocaleString()
  );
  // define new dataset
  const newData = makeQuery(key);
  // set cache for 3mins
  const lifeTime = key === 'current' ? 60 * 30 : 0;
  myCache.set(key, newData, lifeTime); // 3 mins
});

module.exports = { checkCache, makeQuery };
