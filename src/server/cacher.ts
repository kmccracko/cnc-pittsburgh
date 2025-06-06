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

const place = 'place_id=122840';
const curDates = `&d1=${process.env.CURRENT_D1}&d2=${process.env.CURRENT_D2}`;
const prevDates = `&d1=${process.env.PREVIOUS_D1}&d2=${process.env.PREVIOUS_D2}`;
const curProject = 'project_id=' + process.env.PROJECT_ID;
const prevProject = 'project_id=' + process.env.PREVIOUS_PROJECT_ID;

// queries
const queries: Record<string, string> = {
  baseline: `https://api.inaturalist.org/v1/observations/species_counts?${place}&month=${process.env.BASELINE_MONTH}&lrank=species&hrank=species&per_page=1000`,
  previous: `https://api.inaturalist.org/v1/observations/species_counts?${
    process.env.PREVIOUS_PROJECT_ID ? prevProject : place + prevDates
  }&lrank=species&hrank=species&per_page=500`,
  current: `https://api.inaturalist.org/v1/observations/species_counts?${
    process.env.PROJECT_ID ? curProject : place + curDates
  }&lrank=species&hrank=species&per_page=500`,
};

const genHistogramQuery = (taxonId: string): string => {
  return `https://api.inaturalist.org/v1/observations/histogram?verifiable=true&${place}&taxon_id=${taxonId}&quality_grade=research&date_field=observed&interval=week_of_year`;
};

const genUserQuery = (userName: string): string => {
  return `https://api.inaturalist.org/v1/observations/species_counts?${place}&${curProject}&user_id=${userName}&${curDates}&lrank=species&hrank=species&per_page=500`;
};

// Define valid query types
type QueryType = 'baseline' | 'previous' | 'current' | 'histogram' | 'user';

const makeQuery = async (type: QueryType, params?: any) => {
  const dbg = debug(`cncpgh:makeQuery`);
  dbg(`entered makequery for ${type} query`);
  
  // Determine the query to use
  let queryToUse: string = '';
  if (type === 'histogram' && params?.taxonId) {
    queryToUse = genHistogramQuery(params.taxonId);
  } else if (type === 'user' && params?.userName) {
    queryToUse = genUserQuery(params.userName);
  } else if (type === 'baseline' || type === 'previous' || type === 'current') {
    queryToUse = queries[type];
  } else {
    throw new Error(`Invalid query type: ${type}`);
  }
  
  dbg(queryToUse);
  
  const getNextPage: Function = async (page = 1, fullResult: Object[] = []) => {
    try {
      // make query
      const result = await axios.get(`${queryToUse}&page=${page}`);

      if (type === 'histogram') {
        fullResult = result.data.results.week_of_year;
      } else {
        const pageTaxaArr: Object[] = [];
        result.data.results.forEach((el: Object) => {

          // Skip human, dog, and cat
          if (['Homo sapiens', 'Canis familiaris', 'Felis catus'].includes(el.taxon.name)) return;

          pageTaxaArr.push(
          {
            name: el.taxon.preferred_common_name || el.taxon.name,
            scientificname: el.taxon.name,
            count: el.count,
            taxaId: String(el.taxon.id),
            pictureurl: el.taxon.default_photo
              ? el.taxon.default_photo.medium_url
              : null,
            taxon: el.taxon.iconic_taxon_name,
          });
        });
        // update array
        fullResult.push(...pageTaxaArr);
      }

      // recurse if there's more, else return array
      if (result.data.total_results > result.data.per_page * page) {
        return getNextPage(page + 1, fullResult);
      } else {
        dbg('iNat query complete');
        return fullResult;
      }
    } catch (error) {
      // Handle API errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const status = error.response.status;
        const statusText = error.response.statusText;
        const data = error.response.data;
        
        dbg(`API Error: ${status} ${statusText}`);
        dbg(`Error details: ${JSON.stringify(data)}`);
        
        // Handle rate limiting (429 Too Many Requests)
        if (status === 429) {
          dbg('Rate limit exceeded. Returning partial results if available.');
          // Return whatever data we have so far
          return fullResult;
        }
        
        // For other errors, throw a more informative error
        throw new Error(`iNaturalist API error: ${status} ${statusText}`);
      } else if (error.request) {
        // The request was made but no response was received
        dbg('No response received from API');
        throw new Error('No response from iNaturalist API');
      } else {
        // Something happened in setting up the request that triggered an Error
        dbg(`Request setup error: ${error.message}`);
        throw new Error(`Request error: ${error.message}`);
      }
    }
  };
  
  try {
    const parsedResults = await getNextPage();
    return parsedResults;
  } catch (error) {
    dbg(`Error in makeQuery: ${error.message}`);
    // Return empty results instead of crashing
    if (type === 'histogram') {
      return {}; // Empty object for histogram
    } else {
      return []; // Empty array for other queries
    }
  }
};

// check cache function
const checkCache = async (key: string, params?: any) => {
  // For histogram data, create a unique cache key that includes the taxonId
  // For user data, create a unique cache key that includes the username
  let cacheKey;
  if (params?.taxonId) {
    cacheKey = `histogram_${params.taxonId}`;
  } else if (params?.userName) {
    cacheKey = `user_${params.userName}`;
  } else {
    cacheKey = key;
  }
  
  // check for string in cache
  const keyVal = myCache.get(cacheKey);
  let returnVal;
  // if in cache, return value
  if (keyVal) {
    dbg(`"${cacheKey}" already in cache!`);
    returnVal = keyVal;
  }
  // if not in cache, set value and return that
  else {
    dbg(`"${cacheKey}" not in cache.`);

    let lifeTime;

    try {
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
      } else if (key === 'histogram' && params?.taxonId) {
        returnVal = await makeQuery('histogram', params);
        // Cache histogram data for 24 hours (86400 seconds)
        lifeTime = 86400;
      } else if (key === 'user' && params?.userName) {
        returnVal = await makeQuery('user', { userName: params.userName });
        // Cache user data for 5 minutes (300 seconds)
        lifeTime = 300;
      }
      
      if (returnVal) {
        if (Array.isArray(returnVal)) {
          dbg(`Updated "${cacheKey}" in cache with ${returnVal.length} records`);
        } else if (key === 'histogram') {
          dbg(`Updated "${cacheKey}" in cache with histogram for ${params.taxonId}`);
        } else if (key === 'user') {
          dbg(`Updated "${cacheKey}" in cache with user data for ${params.userName}`);
        }
        myCache.set(cacheKey, returnVal, lifeTime);
      }
    } catch (error) {
      dbg(`Error fetching data for ${cacheKey}: ${error.message}`);
      // If there's an error, try to return cached data if available, even if expired
      const expiredVal = myCache.get(cacheKey, true); // true = return expired items
      if (expiredVal) {
        dbg(`Using expired cache for ${cacheKey} due to error`);
        returnVal = expiredVal;
        // Re-cache the expired value with a short TTL
        myCache.set(cacheKey, returnVal, 60); // Cache for 1 minute
      } else {
        // If no cached data available, return empty result
        if (key === 'histogram') {
          returnVal = {}; // Empty object for histogram
        } else {
          returnVal = []; // Empty array for other queries
        }
      }
    }
  }
  
  // get time left on cache
  let timeOfExpiry = myCache.getTtl(cacheKey);
  const timeRemaining = !timeOfExpiry ? 0 : (timeOfExpiry - +new Date()) / 1000;

  dbg({ timeOfExpiry, timeRemaining });
  return { returnVal, timeRemaining };
};

myCache.on('expired', (key: string, value: any) => {
  dbg(`${key} expired! ${new Date().toLocaleString()}`);
});

const clearCache = (cacheType: string) => {
  dbg(`Clearing cache for: ${cacheType}`);

  if (!cacheType) return "Options: 'all', 'baseline', 'previous', 'current', 'histogram'";

  try {
    if (cacheType === 'all') {
      myCache.del('baseline');
      myCache.del('previous');
      myCache.del('current');
      myCache.del('histogram');
    } else {
      myCache.del(cacheType);
    }
    return `Cache cleared for: ${cacheType}`;
  } catch (error) {
    return `Error clearing cache for: ${cacheType}`;
  }
};

module.exports = { checkCache, makeQuery, clearCache };
