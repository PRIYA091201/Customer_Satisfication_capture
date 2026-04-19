import { createClient, SupabaseClient, RealtimeChannel, Database } from '@supabase/supabase-js';
import config from '../config/config';
import logger from './logger';
import { DbTables } from '../types/database.types';
import dbErrorHandler from './db-error-handler';

let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Initialize and get the Supabase client
 * @returns {SupabaseClient} Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  if (!config.supabase.url || !config.supabase.key) {
    throw new Error('Supabase URL and key must be provided in the configuration');
  }

  try {
    supabaseInstance = createClient(config.supabase.url, config.supabase.key);
    logger.info('Supabase client initialized successfully');
    return supabaseInstance;
  } catch (error) {
    logger.error('Failed to initialize Supabase client', error);
    throw error;
  }
}

/**
 * Executes a database health check
 * @returns {Promise<boolean>} True if connection is successful
 */
export async function checkDbConnection(): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.from('health_check').select('*').limit(1);
    
    if (error) {
      logger.error('Database health check failed', error);
      return false;
    }
    
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection error', error);
    return false;
  }
}

/**
 * Create a real-time subscription to a table
 * @param tableName The table to subscribe to
 * @param event The event to listen for (INSERT, UPDATE, DELETE, *)
 * @param callback The callback to execute when the event occurs
 * @returns RealtimeChannel that can be used to unsubscribe
 */
export function createSubscription<T extends keyof DbTables>(
  tableName: T,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  callback: (payload: any) => void
): RealtimeChannel {
  const client = getSupabaseClient();
  
  const channel = client
    .channel(`table-changes:${tableName}`)
    .on(
      'postgres_changes',
      { event, schema: 'public', table: tableName as string },
      (payload) => {
        logger.debug(`Real-time event received from ${tableName}:${event}`, payload);
        callback(payload);
      }
    )
    .subscribe((status) => {
      logger.info(`Subscription to ${tableName} ${status === 'SUBSCRIBED' ? 'established' : status}`);
    });
  
  return channel;
}

/**
 * Unsubscribe from a real-time channel
 * @param channel The channel to unsubscribe from
 */
export async function removeSubscription(channel: RealtimeChannel): Promise<void> {
  try {
    await getSupabaseClient().removeChannel(channel);
    logger.debug('Unsubscribed from channel successfully');
  } catch (error) {
    logger.error('Error unsubscribing from channel', error);
  }
}

export default {
  getSupabaseClient,
  checkDbConnection,
  createSubscription,
  removeSubscription
};