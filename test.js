const { default: axios } = require('axios');

// this query only needs to be run ONCE!
const getFullSpecies = async (page = 1, fullResult = []) => {
  result = await axios.get(
    `https://api.inaturalist.org/v1/observations/species_counts?place_id=122840&month=4%2C5&per_page=100000000&page=${page}`
  );

  // show progress
  console.log('page: ', page);

  // update array
  fullResult.push(
    ...result.data.results.map((el) => {
      return { name: el.taxon.preferred_common_name, count: el.count };
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

// this query needs rerun every 30 minutes!
const getCurrentSpecies = async (page = 1) => {
  result = await axios.get(
    `https://api.inaturalist.org/v1/observations/species_counts?place_id=122840&d1=2022-09-01&d2=2022-09-02&per_page=20&page=${page}`
  );

  // show progress
  console.log('page: ', page);

  // update array
  currentResult = result.data.results.map((el) => {
    return { name: el.taxon.preferred_common_name, count: el.count };
  });
  console.log('cur length: ', currentResult.length);

  // recurse if there's more, else return array
  if (result.data.total_results <= result.data.per_page * page) {
    console.log('no more!');
  }
  return currentResult;
};

const main = async () => {
  const curRes = await getCurrentSpecies();
  const fullRes = await getFullSpecies();
  console.log(curRes);
  console.log(fullRes.length);
  const curResNames = curRes.map((el) => {
    return el.name;
  });
  const fullRes2 = fullRes.filter((el, i, arr) => {
    return curResNames.indexOf(el.name) < 0;
  });
  console.log(fullRes2.length);
};

main();

// const summary = results.results.reduce(
//   (obj, cur) => {
//     console.log([cur.taxon.preferred_common_name]);
//     // obj.total1 += cur.identifications.length;
//     obj.total2++;
//     // if (cur.species_guess === 'Blue Jay') console.log(cur.identifications);
//     // if (obj[cur.species_guess]) {
//     //   obj[cur.species_guess] += 1;
//     // } else {
//     //   obj[cur.species_guess] = 1;
//     // }
//     return obj;
//   },
//   { total1: 0, total2: 0 }
// );
// console.log(summary);
/*

Ways to get info I need:

Get all data for all observations within X criteria

... ?

(ONE TIME each year)
get EVERYTHING at once (15 seconds)
  - store in cache (long term)

(EVERY X MINUTES)
get CURRENT all at once
  - store in cache (short term)
  - compare against EVERYTHING to get differerence

--------------

(on initial LOAD)
bring EVERYTHING into state
  - filter entire list accordingly
  - display first X species of array
  - every time scroll pos hits 80%, load next X
    - slice out array (view.length, view.length + X)







*/
