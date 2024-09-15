/* eslint-disable eol-last */
const pgp = require('pg-promise')();
require('dotenv').config();

const db = pgp({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGNAME,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

module.exports = db;