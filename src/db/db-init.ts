// require db
const db = require('./db-connect.ts');
// require makeQuery
const { makeQuery } = require('../server/cacher');

const initFunc = async () => {
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
  console.log('about to drop table');
  await db.query(dropTable);

  // rebuild table
  console.log('about to build table');
  await db.query(createTable);

  // loop through results and update table
  console.log('about to fill table');
  console.log(fillTable);
  await db.query(fillTable);
};

const testFunc = async () => {
  console.log('about to testfunc');
  const result = await db.query('select * from baseline');
  console.log(result);
};

module.exports = initFunc;

// testFunc();
// initFunc();
