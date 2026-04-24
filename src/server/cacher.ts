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
const baselineBroadMonths = '4,5';
const curDates = `&d1=${process.env.CURRENT_D1}&d2=${process.env.CURRENT_D2}`;
const prevDates = `&d1=${process.env.PREVIOUS_D1}&d2=${process.env.PREVIOUS_D2}`;
const curProject = 'project_id=' + process.env.PROJECT_ID;
const prevProject = 'project_id=' + process.env.PREVIOUS_PROJECT_ID;
const allPreviousProjects = JSON.parse(process.env.ALL_PREVIOUS_PROJECTS || '[]');
const allPreviousProjectsQuery = allPreviousProjects.map((project: string) => `${project}`).join('%2C');

// queries
// inat has "verifiable" as a combination of "quality_grade=needs_id,research", but we're going to use quality_grade instead for alignment with the cnc pgh filters
const queries: Record<string, string> = {
  baseline: `https://api.inaturalist.org/v1/observations/species_counts?project_id=${allPreviousProjectsQuery}&quality_grade=needs_id,research&per_page=1000`,
  baseline_broad: `https://api.inaturalist.org/v1/observations/species_counts?${place}&month=${baselineBroadMonths}&quality_grade=needs_id,research&per_page=1000`,
  previous: `https://api.inaturalist.org/v1/observations/species_counts?${
    process.env.PREVIOUS_PROJECT_ID ? prevProject : place + prevDates
  }&quality_grade=needs_id,research&per_page=500`,
  current: `https://api.inaturalist.org/v1/observations/species_counts?${
    process.env.PROJECT_ID ? curProject : place + curDates
  }&quality_grade=needs_id,research&per_page=500`,
};

const genHistogramQuery = (taxonId: string): string => {
  return `https://api.inaturalist.org/v1/observations/histogram?verifiable=true&${place}&taxon_id=${taxonId}&quality_grade=research&date_field=observed&interval=week_of_year`;
};

const genUserQuery = (userName: string): string => {
  return `https://api.inaturalist.org/v1/observations/species_counts?${curProject}&user_id=${userName}&quality_grade=needs_id,research&per_page=500`;
};

const genBulkFirstObserverQuery = (taxonIds: string[]): string => {
  const taxonIdsCsv = taxonIds.join(',');
  return `https://api.inaturalist.org/v1/observations?project_id=${process.env.PROJECT_ID}&taxon_id=${taxonIdsCsv}&quality_grade=research&order=asc&order_by=created_at&per_page=200`;
};

// Define valid query types
type QueryType =
  | 'baseline'
  | 'baseline_broad'
  | 'previous'
  | 'current'
  | 'histogram'
  | 'user'
  | 'first_observer_bulk';

const makeQuery = async (type: QueryType, params?: any) => {
  const dbg = debug(`cncpgh:makeQuery`);
  dbg(`entered makequery for ${type} query`);
  
  // Determine the query to use
  let queryToUse: string = '';
  if (type === 'histogram' && params?.taxonId) {
    queryToUse = genHistogramQuery(params.taxonId);
  } else if (type === 'user' && params?.userName) {
    queryToUse = genUserQuery(params.userName);
  } else if (type === 'first_observer_bulk' && params?.taxonIds?.length) {
    queryToUse = genBulkFirstObserverQuery(params.taxonIds);
  } else if (
    type === 'baseline' ||
    type === 'baseline_broad' ||
    type === 'previous' ||
    type === 'current'
  ) {
    queryToUse = queries[type];
  } else {
    throw new Error(`Invalid query type: ${type}`);
  }
  
  dbg(queryToUse);
  
  const getNextPage: Function = async (page = 1, fullResult: any = []) => {
    try {
      // make query
      const result = await axios.get(`${queryToUse}&page=${page}`);

      if (type === 'histogram') {
        fullResult = result.data.results.week_of_year;
      } else if (type === 'first_observer_bulk') {
        const observations = result?.data?.results || [];
        const requestedTaxa = new Set((params?.taxonIds || []).map((id: string) => String(id)));
        const speciesByTaxa = params?.speciesByTaxa || {};
        const firstObserverByTaxa: Object = fullResult && !Array.isArray(fullResult) ? fullResult : {};

        for (const observation of observations) {
          const taxonId = String(observation?.taxon?.id || '');
          if (!taxonId || !requestedTaxa.has(taxonId)) continue;
          const createdAt = observation?.created_at;
          if (!createdAt) continue;

          const prev = firstObserverByTaxa[taxonId];
          if (!prev || +new Date(createdAt) < +new Date(prev.createdAt)) {
            firstObserverByTaxa[taxonId] = {
              taxaId: taxonId,
              species:
                observation?.taxon?.preferred_common_name ||
                observation?.taxon?.name ||
                speciesByTaxa[taxonId] ||
                null,
              author: observation?.user?.login || null,
              createdAt,
              hasResearchObservation: true,
              photoUrl: observation?.taxon?.default_photo?.medium_url || null,
              observationId: observation?.id || null,
              scientificname: observation?.taxon?.name || null,
            };
          }
        }

        fullResult = firstObserverByTaxa;
      } else {
        const pageTaxaArr: Object[] = [];
        result.data.results.forEach((el: Object) => {

          // Skip human, dog, and cat
          // Don't skip these anymore 04/23/2026
          // if (['Homo sapiens', 'Canis familiaris', 'Felis catus'].includes(el.taxon.name)) return;

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
            rank: el.taxon.rank
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
    if (type === 'first_observer_bulk') {
      const speciesByTaxa = params?.speciesByTaxa || {};
      const completedResults: Object = {};
      for (const taxonId of params?.taxonIds || []) {
        const normalizedTaxonId = String(taxonId);
        completedResults[normalizedTaxonId] = parsedResults?.[normalizedTaxonId] || {
          taxaId: normalizedTaxonId,
          species: speciesByTaxa[normalizedTaxonId] || null,
          author: null,
          createdAt: null,
          hasResearchObservation: false,
        };
      }
      return completedResults;
    }
    return parsedResults;
  } catch (error) {
    dbg(`Error in makeQuery: ${error.message}`);
    // Return empty results instead of crashing
    if (type === 'histogram') {
      return {}; // Empty object for histogram
    } else if (type === 'first_observer_bulk') {
      return null; // Null indicates lookup failure (unknown), not "no research observations"
    } else {
      return []; // Empty array for other queries
    }
  }
};

/*
* Adds the new species flag to the current species
* Checks for new species observations
* Removes unverified new species
* Returns the verified current species and the visible new species celebrations
*/
const enrichCurrentSpeciesData = async (
  current: Object[] = [],
  baseline: Object[] = []
): Promise<{ verifiedCurrent: Object[]; visibleCelebrations: Object[] }> => {
  const baselineTaxa = new Set((baseline || []).map((species: Object) => species.taxaId));
  const currentWithFlags = (current || []).map((species: Object) => {
    if (species.rank === 'species' && !baselineTaxa.has(species.taxaId)) {
      return { ...species, newspecies: true };
    }
    return species;
  });

  const newSpecies = currentWithFlags.filter((species: Object) => species.newspecies);
  const taxaToCheck = Array.from(
    new Map(
      newSpecies.map((species: Object) => [
        String(species.taxaId),
        {
          taxaId: String(species.taxaId),
          speciesName: species.name || species.scientificname || null,
        },
      ])
    ).values()
  );
  const taxonIds = taxaToCheck.map((el: Object) => String(el.taxaId));
  if (!taxonIds.length) return { verifiedCurrent: currentWithFlags, visibleCelebrations: [] };

  const speciesByTaxa = Object.fromEntries(
    taxaToCheck.map((el: Object) => [String(el.taxaId), el.speciesName || null])
  );
  const { returnVal } = await checkCache('first_observer_bulk', { taxonIds, speciesByTaxa });
  const firstObserverByTaxa = returnVal;
  const queryFailed = !firstObserverByTaxa;
  const celebrations = taxonIds.map((taxaId: string) => {
    return (
      firstObserverByTaxa?.[taxaId] || {
        taxaId,
        species: speciesByTaxa[taxaId] || null,
        author: null,
        createdAt: null,
        hasResearchObservation: queryFailed ? null : false,
      }
    );
  });

  const noResearchTaxa = new Set(
    celebrations
      .filter((entry: Object) => entry?.hasResearchObservation === false)
      .map((entry: Object) => String(entry.taxaId))
  );
  const verifiedCurrent = currentWithFlags.map((species: Object) => {
    if (species.newspecies && noResearchTaxa.has(String(species.taxaId))) {
      return { ...species, newspecies: false };
    }
    return species;
  });

  const visibleCelebrations = celebrations.filter(
    (el: Object) => el && el.author && el.species
  );

  return { verifiedCurrent, visibleCelebrations };
};

// check cache function
const checkCache = async (key: string, params?: any) => {
  // For histogram data, create a unique cache key that includes the taxonId
  // For user data, create a unique cache key that includes the username
  let cacheKey;
  if (params?.taxonId) {
    cacheKey = `histogram_${params.taxonId}`;
  } else if (key === 'first_observer_bulk' && params?.taxonIds?.length) {
    cacheKey = `first_observer_bulk`;
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
      if (key === 'baseline' || key === 'baseline_broad' || key === 'previous') {
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
      } else if (key === 'first_observer_bulk' && params?.taxonIds?.length) {
        returnVal = await makeQuery('first_observer_bulk', params);
        lifeTime = newLifeTime;
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
        } else if (key === 'first_observer_bulk') {
          dbg(`Updated "${cacheKey}" in cache with bulk first observer data`);
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
        } else if (key === 'first_observer_bulk') {
          returnVal = null;
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

  if (!cacheType)
    return "Options: 'all', 'baseline', 'baseline_broad', 'previous', 'current', 'histogram', 'first_observer_bulk'";

  try {
    if (cacheType === 'all') {
      myCache.del('baseline');
      myCache.del('baseline_broad');
      myCache.del('previous');
      myCache.del('current');
      myCache.del('histogram');
      myCache.del('first_observer_bulk');
    } else {
      myCache.del(cacheType);
    }
    return `Cache cleared for: ${cacheType}`;
  } catch (error) {
    return `Error clearing cache for: ${cacheType}`;
  }
};

module.exports = { checkCache, makeQuery, clearCache, enrichCurrentSpeciesData };
