import fs from 'fs';
import path from 'path';
import db from '../utils/db';
import logger from '../utils/logger';

/**
 * Run database migrations from SQL files
 * @param directory Directory containing migration SQL files
 */
export async function runMigrations(directory: string = path.join(__dirname)) {
  logger.info(`Running migrations from ${directory}`);
  
  try {
    // Create migrations table if it doesn't exist
    await createMigrationsTable();
    
    // Get list of applied migrations
    const appliedMigrations = await getAppliedMigrations();
    
    // Get all migration files
    const files = await fs.promises.readdir(directory);
    const migrationFiles = files
      .filter(file => file.endsWith('.sql') && file !== 'setup-schema.sql' && file !== 'stored-procedures.sql')
      .sort(); // Sort alphabetically to ensure order
    
    // Apply migrations that haven't been applied yet
    for (const file of migrationFiles) {
      if (!appliedMigrations.includes(file)) {
        logger.info(`Applying migration: ${file}`);
        
        try {
          const filePath = path.join(directory, file);
          const sql = await fs.promises.readFile(filePath, 'utf8');
          
          // Execute migration in a transaction
          const client = db.getSupabaseClient();
          const { error } = await client.rpc('execute_sql', { query: sql });
          
          if (error) {
            logger.error(`Error applying migration ${file}:`, error);
            throw error;
          }
          
          // Record successful migration
          await recordMigration(file);
          logger.info(`Migration applied successfully: ${file}`);
        } catch (error) {
          logger.error(`Failed to apply migration ${file}:`, error);
          throw error;
        }
      } else {
        logger.debug(`Migration already applied: ${file}`);
      }
    }
    
    logger.info('All migrations completed successfully');
    return { success: true };
  } catch (error) {
    logger.error('Migration process failed:', error);
    return { success: false, error };
  }
}

/**
 * Create migrations table if it doesn't exist
 */
async function createMigrationsTable() {
  const client = db.getSupabaseClient();
  
  const sql = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  
  const { error } = await client.rpc('execute_sql', { query: sql });
  
  if (error) {
    logger.error('Failed to create migrations table:', error);
    throw error;
  }
}

/**
 * Get list of migrations that have already been applied
 */
async function getAppliedMigrations(): Promise<string[]> {
  const client = db.getSupabaseClient();
  
  try {
    const { data, error } = await client
      .from('migrations')
      .select('name')
      .order('applied_at', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data.map(row => row.name);
  } catch (error) {
    // If the table doesn't exist yet, return empty array
    logger.debug('Migrations table may not exist yet:', error);
    return [];
  }
}

/**
 * Record a successful migration
 */
async function recordMigration(name: string) {
  const client = db.getSupabaseClient();
  
  const { error } = await client
    .from('migrations')
    .insert({ name });
  
  if (error) {
    logger.error(`Failed to record migration ${name}:`, error);
    throw error;
  }
}

// Utility to generate a new migration file
export function generateMigrationFile(name: string): string {
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '');
  const filename = `${timestamp}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.sql`;
  const filePath = path.join(__dirname, filename);
  
  const template = `-- Migration: ${name}
-- Created at: ${new Date().toISOString()}

-- Write your migration SQL here

-- Example:
-- CREATE TABLE example (
--   id SERIAL PRIMARY KEY,
--   name TEXT NOT NULL
-- );

-- Don't forget to handle rollbacks if needed
`;
  
  fs.writeFileSync(filePath, template);
  logger.info(`Generated migration file: ${filePath}`);
  
  return filePath;
}

export default {
  runMigrations,
  generateMigrationFile
};