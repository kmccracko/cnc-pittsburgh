const NodeCache = require('node-cache');

const myCache = new NodeCache({ stdTTL: 0, checkperiod: 30 });

// check cache function
const checkCache = async (key: string) => {
  // check for string in cache
  const keyVal = myCache.get(key);
  // if in cache, return value
  if (keyVal) {
    console.log('already in cache!');
    return keyVal;
  }
  // if not in cache, set value and return that
  else {
    console.log('not in cache. about to create a key');
    const newData = 'FILL THIS OUT';
    myCache.set(key, newData, 60 * 3);
    return newData;
  }
};

myCache.on('expired', (key: string, value: any) => {
  console.log(key, ' expired! about to replace it?');
  // define new dataset
  const newData = 'FILL THIS OUT';
  // set cache for 30mins
  myCache.set(key, newData, 60 * 3);
});
