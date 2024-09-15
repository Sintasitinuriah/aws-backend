require('dotenv').config();

module.exports = {
  databaseUrl: process.env.DATABASE_URL,
  migrationDirectory: process.env.MIGRATION_DIR || 'migrations',
  migrationsTable: 'pgmigrations',
};
