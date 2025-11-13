const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect((err) => {
    if (err) {
        console.error('Database connection error:', err.stack);
    } else {
        console.log('Connected to PostgreSQL database!');
    }
});

// Prevent unhandled client errors from crashing the process
pool.on('error', (err) => {
    console.error('Unexpected PG client error:', err);
});

module.exports = pool;
