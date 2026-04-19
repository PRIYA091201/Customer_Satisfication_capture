import dotenv from 'dotenv';
dotenv.config();

import migration from '../db/migration';
import path from 'path';
import logger from '../utils/logger';

async function main() {
  try {
    logger.info('Starting database migration process');
    
    const migrationsDir = path.join(__dirname, '../db');
    const result = await migration.runMigrations(migrationsDir);
    
    if (result.success) {
      logger.info('All migrations completed successfully');
      process.exit(0);
    } else {
      logger.error('Migration process failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    logger.error('Unhandled error in migration script:', error);
    process.exit(1);
  }
}

main();