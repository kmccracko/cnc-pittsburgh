// require db
const db = require('./db-connect.ts');
// require makeQuery
const { makeQuery } = require('../server/cacher');

const initializeDB = async () => {
  // make query
  const result = await makeQuery('baseline');

  // set up queries
  const dropTable = `
  DROP TABLE baseline`;

  const createTable = `
  create table baseline (
  taxaid int,
  count int,
  name varchar,
  scientificname varchar,
  pictureurl varchar,
  taxon varchar
  );
  `;

  const fillTable = `
  INSERT INTO baseline (name, scientificname, count, taxaid, pictureurl, taxon)
  VALUES 
  ${JSON.stringify(
    result.map((obj: any) => {
      return Object.values(obj);
    })
  )
    .replaceAll("'", "''")
    .replaceAll('"', "'")
    .replaceAll('[', '(')
    .replaceAll(']', ')')
    .slice(1, -1)}
  ;`;

  // drop table
  await db.query(dropTable).catch((err: Error) => {
    console.log('faled during table drop');
  });

  // rebuild table
  await db.query(createTable).catch((err: Error) => {
    console.log('faled during table create');
  });

  // loop through results and update table
  await db.query(fillTable).catch((err: Error) => {
    console.log('faled during table fill');
  });
};

const testFunc = async () => {
  console.log('about to testfunc');
  const result = await db.query('select * from baseline');
  console.log(result);
};

module.exports = { initializeDB, testFunc };

// testFunc();
// initFunc();
