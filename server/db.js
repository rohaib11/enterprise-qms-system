const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Test the connection immediately on startup
pool.connect()
  .then(() => console.log('🟢 Connected to PostgreSQL Database successfully!'))
  .catch(err => console.error('🔴 PostgreSQL Connection Error:', err.stack));

module.exports = pool;