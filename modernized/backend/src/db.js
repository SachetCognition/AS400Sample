// Database connection pool
// Replaces MOB1CPL0 logical file access (keyed DISK file) from MODYDFR.rpgle line 32
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/college_db',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
