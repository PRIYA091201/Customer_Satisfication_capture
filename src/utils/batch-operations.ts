import db from './db';
import logger from './logger';
import { DbTables, Tables } from '../types/database.types';
import fs from 'fs';
import { Parser } from 'json2csv';

/**
 * Batch insert records into a table
 * @param tableName Table to insert into
 * @param records Records to insert
 * @param batchSize Size of each batch
 * @returns Result with success count and errors
 */
export async function batchInsert<T extends keyof DbTables>(
  tableName: T,
  records: DbTables[T][],
  batchSize: number = 100
): Promise<{ success: number; errors: any[] }> {
  const client = db.getSupabaseClient();
  const errors: any[] = [];
  let successCount = 0;
  
  try {
    // Process records in batches
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      const { data, error } = await client
        .from(tableName as string)
        .insert(batch);
      
      if (error) {
        logger.error(`Error in batch insert for ${String(tableName)}:`, error);
        errors.push(error);
      } else {
        successCount += batch.length;
        logger.debug(`Successfully inserted batch ${i/batchSize + 1} with ${batch.length} records`);
      }
    }
    
    return { success: successCount, errors };
  } catch (error) {
    logger.error(`Unexpected error in batch insert for ${String(tableName)}:`, error);
    errors.push(error);
    return { success: successCount, errors };
  }
}

/**
 * Export table data to CSV file
 * @param tableName Table to export
 * @param filePath Path to save CSV file
 * @param options Export options
 * @returns Success status
 */
export async function exportTableToCsv<T extends keyof DbTables>(
  tableName: T,
  filePath: string,
  options: {
    filter?: (query: any) => any;
    fields?: string[];
    includeHeader?: boolean;
  } = {}
): Promise<{ success: boolean; error?: any; count?: number }> {
  const { filter, fields, includeHeader = true } = options;
  const client = db.getSupabaseClient();
  
  try {
    // Build query
    let query = client.from(tableName as string).select('*');
    
    // Apply filter if provided
    if (filter) {
      query = filter(query);
    }
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      logger.error(`Error fetching data for CSV export from ${String(tableName)}:`, error);
      return { success: false, error };
    }
    
    if (!data || data.length === 0) {
      logger.warn(`No data found for export from ${String(tableName)}`);
      return { success: true, count: 0 };
    }
    
    // Convert to CSV
    const parser = new Parser({ 
      fields: fields || Object.keys(data[0]),
      header: includeHeader
    });
    
    const csv = parser.parse(data);
    
    // Write to file
    fs.writeFileSync(filePath, csv);
    
    logger.info(`Successfully exported ${data.length} records to ${filePath}`);
    return { success: true, count: data.length };
  } catch (error) {
    logger.error(`Unexpected error exporting ${String(tableName)} to CSV:`, error);
    return { success: false, error };
  }
}

/**
 * Import data from CSV file
 * @param tableName Table to import into
 * @param filePath Path to CSV file
 * @param options Import options
 * @returns Success status
 */
export async function importFromCsv<T extends keyof DbTables>(
  tableName: T,
  filePath: string,
  options: {
    transform?: (record: any) => any;
    batchSize?: number;
    skipHeader?: boolean;
  } = {}
): Promise<{ success: boolean; error?: any; count?: number }> {
  const { transform, batchSize = 100, skipHeader = true } = options;
  
  try {
    // Read CSV file
    const csvContent = fs.readFileSync(filePath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Skip header if specified
    const startIndex = skipHeader ? 1 : 0;
    if (startIndex >= lines.length) {
      return { success: true, count: 0 };
    }
    
    // Parse CSV to objects
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"(.*)"$/, '$1'));
    const records = [];
    
    for (let i = startIndex; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1'));
      const record: any = {};
      
      headers.forEach((header, index) => {
        record[header] = values[index];
      });
      
      // Apply transformation if provided
      const transformedRecord = transform ? transform(record) : record;
      records.push(transformedRecord);
    }
    
    // Batch insert records
    const result = await batchInsert(tableName, records, batchSize);
    
    if (result.errors.length > 0) {
      logger.warn(`Imported ${result.success} records with ${result.errors.length} errors`);
      return { 
        success: result.success > 0, 
        error: result.errors,
        count: result.success
      };
    }
    
    logger.info(`Successfully imported ${result.success} records to ${String(tableName)}`);
    return { success: true, count: result.success };
  } catch (error) {
    logger.error(`Unexpected error importing from CSV to ${String(tableName)}:`, error);
    return { success: false, error };
  }
}

export default {
  batchInsert,
  exportTableToCsv,
  importFromCsv
};