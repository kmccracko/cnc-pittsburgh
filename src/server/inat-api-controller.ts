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
      `https://api.inaturalist.org/v1/observations/species_counts?place_id=122840&month=4%2C5&per_page=200&page=${page}`
    );

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
    // if (result.data.total_results > result.data.per_page * page * 4) {
    //   return getFullSpecies(page + 1, fullResult);
    // } else {
    return fullResult;
    // }
  };

  const summary = await getFullSpecies();

  res.locals.data0 = summary;
  return next();
};

inat.getObs1 = async (req: Request, res: Response, next: NextFunction) => {
  const getCurrentSpecies = async (page = 1) => {
    const result = await axios.get(
      `https://api.inaturalist.org/v1/observations/species_counts?place_id=122840&d1=2022-09-01&d2=2022-09-08&per_page=500&page=${page}`
    );

    // update array
    const currentResult = result.data.results.map((el: Object) => {
      return {
        name: el.taxon.preferred_common_name,
        count: el.count,
        pictureUrl: el.taxon.default_photo ? el.taxon.default_photo.url : null,
      };
    });
    console.log('cur length: ', currentResult.length);

    return currentResult;
  };

  const summary = await getCurrentSpecies();
  res.locals.data1 = summary;
  return next();
};

module.exports = inat;
