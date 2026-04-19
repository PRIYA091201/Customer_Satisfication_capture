import { SupabaseClient, PostgrestFilterBuilder } from '@supabase/supabase-js';
import db from './db';
import logger from './logger';
import { DbTables, PaginationOptions, PaginatedResponse } from '../types/database.types';

/**
 * Generic database query function with error handling
 * @param tableName The table to query
 * @param operation The operation to perform (select, insert, update, delete)
 * @param data The data to use in the operation (optional)
 * @param constraints Query constraints (optional)
 * @returns Result of the database operation
 */
export async function executeQuery<T extends keyof DbTables, R = DbTables[T]>(
  tableName: T,
  operation: 'select' | 'insert' | 'update' | 'delete',
  data?: Partial<DbTables[T]>,
  constraints?: (query: PostgrestFilterBuilder<any, any, any>) => PostgrestFilterBuilder<any, any, any>
): Promise<{ data: R | null; error: Error | null }> {
  const client = db.getSupabaseClient();

  try {
    let query;

    switch (operation) {
      case 'select':
        query = client.from(tableName).select('*');
        break;
      case 'insert':
        query = client.from(tableName).insert(data);
        break;
      case 'update':
        query = client.from(tableName).update(data);
        break;
      case 'delete':
        query = client.from(tableName).delete();
        break;
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

    // Apply additional constraints if provided
    if (constraints && typeof constraints === 'function') {
      query = constraints(query);
    }

    const { data: result, error } = await query;

    if (error) {
      logger.error(`Database ${operation} error`, error);
      return { data: null, error };
    }

    return { data: result as T, error: null };
  } catch (error) {
    logger.error(`Unexpected error in ${operation} operation`, error);
    return { data: null, error: error as Error };
  }
}

/**
 * Execute a raw SQL query
 * @param sql The SQL query string
 * @param params Optional parameters for the query
 * @returns Result of the SQL query
 */
export async function executeRawQuery<T>(
  sql: string,
  params?: any[]
): Promise<{ data: T | null; error: Error | null }> {
  const client = db.getSupabaseClient();

  try {
    const { data, error } = await client.rpc('execute_sql', {
      query: sql,
      params: params || [],
    });

    if (error) {
      logger.error('Raw SQL query error', error);
      return { data: null, error };
    }

    return { data: data as T, error: null };
  } catch (error) {
    logger.error('Unexpected error in raw SQL query', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Helper function to build a paginated query
 * @param client Supabase client
 * @param tableName Table to query
 * @param page Page number (starting from 1)
 * @param pageSize Number of items per page
 * @param orderField Field to order by
 * @param orderDirection Direction to order (asc or desc)
 * @returns Paginated query
 */
/**
 * Helper function to build a paginated query
 * @param client Supabase client
 * @param tableName Table to query
 * @param options Pagination options
 * @returns Paginated query
 */
export function buildPaginatedQuery<T extends keyof DbTables>(
  client: SupabaseClient,
  tableName: T,
  options: PaginationOptions
) {
  const { page = 1, pageSize = 10, orderBy = 'created_at', orderDirection = 'desc' } = options;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  return client
    .from(tableName)
    .select('*', { count: 'exact' })
    .order(orderBy, { ascending: orderDirection === 'asc' })
    .range(start, end);
}

/**
 * Execute a paginated query and format the response
 * @param tableName Table to query
 * @param options Pagination options
 * @param additionalConstraints Additional query constraints
 * @returns Paginated response
 */
export async function getPaginatedResults<T extends keyof DbTables>(
  tableName: T,
  options: PaginationOptions,
  additionalConstraints?: (query: PostgrestFilterBuilder<any, any, any>) => PostgrestFilterBuilder<any, any, any>
): Promise<{ data: PaginatedResponse<DbTables[T]> | null; error: Error | null }> {
  const client = db.getSupabaseClient();
  const { page = 1, pageSize = 10 } = options;
  
  try {
    let query = buildPaginatedQuery(client, tableName, options);
    
    if (additionalConstraints && typeof additionalConstraints === 'function') {
      query = additionalConstraints(query);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error(`Paginated query error for ${String(tableName)}`, error);
      return { data: null, error };
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    const paginatedResponse: PaginatedResponse<DbTables[T]> = {
      data: data as DbTables[T][],
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages,
        hasMore: page < totalPages,
      },
    };

    return { data: paginatedResponse, error: null };
  } catch (error) {
    logger.error(`Unexpected error in paginated query for ${String(tableName)}`, error);
    return { data: null, error: error as Error };
  }
}

export default {
  executeQuery,
  executeRawQuery,
  buildPaginatedQuery,
  getPaginatedResults,
};