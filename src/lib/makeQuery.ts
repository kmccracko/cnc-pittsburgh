import axios from 'axios';

import { Object } from '../types';

// queries
const queries: Object = {
  // baseline: `https://api.inaturalist.org/v1/observations/species_counts?place_id=122840&month=4%2C5&per_page=1000`,
  baseline: `https://api.inaturalist.org/v1/observations/species_counts?place_id=122840&month=9&per_page=1000`,
  // current: `https://api.inaturalist.org/v1/observations/species_counts?place_id=122840&d1=2022-04-28&d2=2022-05-02&per_page=500`,
  current: `https://api.inaturalist.org/v1/observations/species_counts?place_id=122840&d1=2022-09-21&d2=2022-09-30&per_page=500`,
};

// make query function
const queryApi = async (
  type: string,
  createdSince?: string,
  createdUntil?: string
) => {
  console.log('entered makequery');

  const createdStr = createdSince
    ? `&created_d1=${createdSince}&created_d2=${createdUntil}`
    : '';

  const getNextPage: Function = async (page = 1, fullResult: Object[] = []) => {
    // make query
    let result;
    if (type === 'current') {
      result = await axios.get(`${queries[type]}&page=${page}${createdStr}`);
    } else {
      result = await axios.get(`${queries[type]}&page=${page}`);
    }

    // show progress
    console.log('total results: ', result.data.total_results);
    console.log('page: ', page);

    // update array
    fullResult.push(
      ...result.data.results.map((el: Object) => {
        return {
          taxaid: el.taxon.id,
          count: el.count,
          name: el.taxon.preferred_common_name,
          scientificname: el.taxon.name,
          pictureurl: el.taxon.default_photo
            ? el.taxon.default_photo.medium_url
            : null,
          taxon: el.taxon.iconic_taxon_name,
        };
      })
    );
    console.log('full length of api results: ', fullResult.length);

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

module.exports = queryApi;
