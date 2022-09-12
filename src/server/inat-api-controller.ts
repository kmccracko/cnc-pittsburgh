import axios, { AxiosResponse } from 'axios';
import { Request, Response, NextFunction, RequestHandler } from 'express';

type controller = {
  [key: string]: Function;
};

type Object = {
  [key: string]: any;
};

const inat: controller = {};

// add funcs

inat.getObs0 = async (req: Request, res: Response, next: NextFunction) => {
  const getFullSpecies: Function = async (
    page = 1,
    fullResult: Object[] = []
  ) => {
    const result = await axios.get(
      `https://api.inaturalist.org/v1/observations/species_counts?place_id=122840&month=4%2C5&per_page=1000&page=${page}`
    );

    console.log('total results: ', result.data.total_results)

    // show progress
    console.log('page: ', page);

    // update array
    fullResult.push(
      ...result.data.results.map((el: Object) => {
        return {
          name: el.taxon.preferred_common_name,
          count: el.count,
          pictureUrl: el.taxon.default_photo
            ? el.taxon.default_photo.medium_url
            : null,
          taxon: el.taxon.iconic_taxon_name,
        };
      })
    );
    console.log('full length: ', fullResult.length);

    // recurse if there's more, else return array
    if (result.data.total_results > result.data.per_page * page) {
      return getFullSpecies(page + 1, fullResult);
    } else {
    return fullResult;
    }
  };

  const summary = await getFullSpecies();

  res.locals.data0 = summary;
  return next();
};
 
inat.getObs1 = async (req: Request, res: Response, next: NextFunction) => {
  const getCurrentSpecies = async (page = 1, currentResult: Object[] = []): Promise<Object[]> => {
    const result = await axios.get(
      `https://api.inaturalist.org/v1/observations/species_counts?place_id=122840&d1=2022-04-28&d2=2022-05-02&per_page=500&page=${page}`
    );

    console.log('total results: ', result.data.total_results)

    // update array
    currentResult.push(
      ...result.data.results.map((el: Object) => {
        return {
          name: el.taxon.preferred_common_name,
          count: el.count,
        };
      })
    );

    console.log('cur length: ', currentResult.length);


    // recurse if there's more, else return array
    if (result.data.total_results > result.data.per_page * page) {
      return getCurrentSpecies(page + 1, currentResult);
    } else {
    return currentResult;
    }
  };
  
  
  const summary = await getCurrentSpecies();
  res.locals.data1 = summary;
  return next();
};

module.exports = inat;
