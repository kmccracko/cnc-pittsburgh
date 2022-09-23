const NodeCache = require('node-cache');

import { Object } from '../types';

const myCache = new NodeCache({ stdTTL: 0, checkperiod: 60 * 30 });
const db = require('../db/db-connect');
const { reinitializeCurrent } = require('../db/db-init');
const makeQuery = require('../lib/makeQuery');

// check cache function
const checkCache = async (key: string) => {
  console.log(
    ' accessing cache, looking for',
    key,
    ' - ',
    new Date().toLocaleString()
  );
  console.log('cache contains - ', myCache.keys());
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
    }
    if (key === 'current') {
      lifeTime = 60 * 10;
      // send query to DB to get last pull time
      let oldLastPull = await db.query(
        `select value from info where label = 'last pull';`
      );
      oldLastPull = oldLastPull.rows[0].value;
      // send query to DB to get everything in Current, reduce result to {id:obj, id:obj}
      let allCurrent = await db.query(`select * from current;`);
      allCurrent = allCurrent.rows;

      const allCurrentObj: Object = {};
      for (let el of allCurrent) allCurrentObj[el.taxaid] = el;

      // save current timestamp in a variable
      const newLastPull = new Date().toISOString();

      // send query to DB to update last pull time to "current" we just saved
      await db.query(`update info set value = $1 where label = 'last pull'`, [
        newLastPull,
      ]);

      // make query to INAT API for everything SINCE last pull UNTIL "current" time
      // unless oldCurrent is empty, in which case make full current query
      console.log('about to pull from ', oldLastPull, ' to ', newLastPull);
      console.log('current length BEFORE API request: ', allCurrent.length);
      const newCurrent = allCurrent.length
        ? await makeQuery(key, oldLastPull, newLastPull)
        : await makeQuery(key);

      // iterate through result, add/update everything to the current object
      for (let el of newCurrent) {
        if (allCurrentObj.hasOwnProperty(el.taxaid)) {
          console.log(
            el.scientificname,
            'already in current.',
            allCurrentObj[el.taxaid].count,
            '-',
            allCurrentObj[el.taxaid].count + el.count
          );
          allCurrentObj[el.taxaid].count += el.count;
        } else {
          console.log(el.scientificname, 'is new to current!');
          allCurrentObj[el.taxaid] = el;
        }
      }

      // reduce result to [obj, obj]
      newData = Object.values(allCurrentObj);
      console.log('current length AFTER api request: ', newData.length);

      // update DB with new current data, only if there's new data
      if (newCurrent.length) await reinitializeCurrent(newData);
    }
    myCache.set(key, newData, lifeTime); // 3 mins
    returnVal = newData;
  }
  return returnVal;
};

myCache.on('expired', (key: string, value: any) => {
  console.log(
    key,
    ' expired! key should die now - ',
    new Date().toLocaleString()
  );
});

module.exports = checkCache;
