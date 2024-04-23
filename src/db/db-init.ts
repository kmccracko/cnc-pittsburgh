const db = require('./db-connect.ts');
const { makeQuery } = require('../server/cacher');
import debug from '../../betterDebug';
const dbg = debug(`cncpgh:database`);

const updateInfo = async (label: string, value: string, replace?: boolean) => {
  dbg(`${replace ? 'UPDATING' : 'INSERTING'} ${label} to be ${value}`);
  const params: string[] = [label, value];
  const updateQuery = `
  UPDATE info
  SET value = $2
  WHERE label = $1;
  `;
  const insertQuery = `
  INSERT INTO info
  VALUES ($1, $2);
  `;
  await db
    .query(replace ? updateQuery : insertQuery, params)
    .catch((err: Error) => {
      console.error(err);
      console.error('Failed during info update:', { label, value, replace });
    });
};

const initializeDataTable = async (tableName: string) => {
  dbg(`Initializing ${tableName} table...`);
  // Query iNaturalist for data
  const result = await makeQuery(tableName);

  //? Table schema for Baseline and Previous
  // CREATE TABLE baseline (
  // "taxaId" varchar,
  // count int,
  // name varchar,
  // scientificname varchar,
  // pictureurl varchar,
  // taxon varchar
  // );

  const truncTable = `
  TRUNCATE TABLE ${tableName};`;

  const fillTable = `
  INSERT INTO ${tableName} (name, scientificname, count, "taxaId", pictureurl, taxon)
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

  // truncate table
  await db.query(truncTable).catch((err: Error) => {
    console.error('Failed during table truncation: ', err);
  });

  // loop through results and update table
  await db.query(fillTable).catch((err: Error) => {
    console.error('Failed during table fill: ', err);
  });
};

const checkEnv = async (cmd: string) => {
  // Pre-check required environment variables
  const requiredEnv = ['BASELINE_MONTH', 'PREVIOUS_D1', 'PREVIOUS_D2'];
  let prevFlag = false;
  for (const envName of requiredEnv) {
    if (!process.env[envName]) {
      throw new Error(`No ${envName} in ENV`);
    }
  }

  if (cmd === 'force') {
    await initializeDataTable('baseline');
    await initializeDataTable('previous');
  }

  // Pull saved env info
  const getInfo: string = `
  SELECT * 
  FROM info;`;

  const result = await db.query(getInfo).catch((err: Error) => {
    console.error('Failed while retrieving ENV info: ', err);
  });

  // Loop through env expectations
  for (const envName of requiredEnv) {
    const record = result.rows.find(
      (r: any) => r.label === envName.toLowerCase()
    );

    if (!record || record.value !== process.env[envName]) {
      await updateInfo(envName.toLowerCase(), process.env[envName], !!record);

      if (envName.toLowerCase() === 'baseline_month') {
        await initializeDataTable('baseline');
      } else prevFlag = true;
    }
  }

  // If any prev dates are missing or changed, update table
  if (prevFlag) await initializeDataTable('previous');
};

module.exports = { checkEnv, initializeDataTable };
