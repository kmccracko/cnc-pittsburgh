const { Pool } = require('pg');

const createPool = () => {
  let poolConfig;
  if (process.env.NODE_ENV === 'development') {
    poolConfig = {
      host: process.env.DEV_HOST_IP,
      port: 5434,
      user: 'postgres',
      password: 'password',
      database: 'cncpgh_dev'
    };
  } else {
    poolConfig = {
      connectionString: process.env.CNC_PG_URI,
    };
  }

  let pool: any;
  try {
    console.log('Attempting to connect with config:', {
      ...poolConfig,
      password: '*****' // Hide password in logs
    });
    pool = new Pool(poolConfig);
    console.log(`Connected to ${poolConfig.database} DB!`);
  } catch (error) {
    console.error(`Could not connect to ${poolConfig.database} DB: `, error);
  }
  return pool;
}

const pool = createPool();

// Test query: select * from baseline;
// const testQuery = async () => {
//   console.log('testQuery');
//   const result = await pool.query('SELECT * FROM baseline;');
//   console.log(result.rows.length);
// };
// testQuery();

// We export an object that contains a property called query,
// which is a function that returns the invocation of pool.query() after logging the query
// This will be required in the controllers to be the access point to the database
module.exports = {
  query: (text: string, params: any, callback: Function) => {
    // console.log('executed query', text);
    return pool.query(text, params, callback);
  },
};
