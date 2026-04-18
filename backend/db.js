const mysql = require('mysql2');
require('dotenv').config();

// STRICT RULE ENFORCED: No ORMs. Raw mysql2 pool connection.
const pool = mysql.createPool(process.env.DATABASE_URL);

// Use promises for standard async/await support
const promisePool = pool.promise();

// Check connection to verify the DB is reachable
promisePool.getConnection()
  .then(connection => {
    console.log('Database connected successfully via raw mysql2 pool!');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

module.exports = promisePool;
