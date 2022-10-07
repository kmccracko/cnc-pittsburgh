// require db
const db = require('./db-connect.ts');
// require makeQuery
const { makeQuery } = require('../server/cacher');

const initializeDB = async () => {
  // update info table with ENV values
  const params: string[] = [process.env.BASELINE_MONTH];
  const updateInfo = `
  UPDATE info
  SET value = $1
  WHERE label = 'baseline_month';
  `;
  await db.query(updateInfo, params).catch((err: Error) => {
    console.log('failed during env update');
  });

  // make query
  const result = await makeQuery('baseline');

  // set up queries
  const dropTable = `
  DROP TABLE baseline;`;

  const createTable = `
  CREATE TABLE baseline (
  "taxaId" varchar,
  count int,
  name varchar,
  scientificname varchar,
  pictureurl varchar,
  taxon varchar,
  found boolean
  );
  `;

  const fillTable = `
  INSERT INTO baseline (name, scientificname, count, "taxaId", pictureurl, taxon, found)
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
    console.log('failed during table drop');
  });

  // rebuild table
  await db.query(createTable).catch((err: Error) => {
    console.log('failed during table create');
  });

  // loop through results and update table
  await db.query(fillTable).catch((err: Error) => {
    console.log('failed during table fill');
  });
};

const checkEnv = async () => {
  // pull saved env info
  const getInfo: string = `
  SELECT value
  FROM info
  WHERE label = 'baseline_month'`;

  const result = await db.query(getInfo).catch((err: Error) => {
    console.log('failed while retrieving ENV info');
  });

  if (result.rows.length) {
    console.log(result.rows[0].value, process.env.BASELINE_MONTH);
    if (result.rows[0].value === process.env.BASELINE_MONTH) return;
    else {
      console.log(
        'baseline month does not match ENV! going initialize DB with new baseline.'
      );
    }
  } else {
    console.log('baseline month does not exist! going to insert new record.');
    const params: string[] = [process.env.BASELINE_MONTH];
    const updateInfo = `
    INSERT INTO info 
    VALUES ('baseline_month', $1
    );
    `;
    await db.query(updateInfo, params).catch((err: Error) => {
      console.log('failed during env insert');
    });
  }
  // this will drop baseline and fill it
  // we don't need to worry about the current table bc we don't use it
  // so we don't need to check current_d1 or _d2
  await initializeDB();
};

const testFunc = async () => {
  console.log('about to testfunc');
  const result = await db.query('select * from baseline');
  console.log(result);
};

module.exports = { checkEnv, initializeDB, testFunc };

// testFunc();
// initFunc();
