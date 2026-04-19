import db from '../utils/db';
import dbOps from '../utils/db-operations';
import logger from '../utils/logger';
import { CustomerFeedback, Tables, PaginationOptions, PaginatedResponse } from '../types/database.types';
import { RealtimeChannel } from '@supabase/supabase-js';

// Map of active subscriptions
const activeSubscriptions: Map<string, RealtimeChannel> = new Map();

/**
 * Get paginated customer feedback
 */
export async function getFeedbackPaginated(options: PaginationOptions) {
  return dbOps.getPaginatedResults(Tables.CUSTOMER_FEEDBACK, options);
}

/**
 * Get feedback by ID
 */
export async function getFeedbackById(id: number | string) {
  return dbOps.executeQuery(
    Tables.CUSTOMER_FEEDBACK,
    'select',
    undefined,
    query => query.eq('id', id).single()
  );
}

/**
 * Create new feedback
 */
export async function createFeedback(feedbackData: CustomerFeedback) {
  return dbOps.executeQuery(
    Tables.CUSTOMER_FEEDBACK,
    'insert',
    feedbackData,
    query => query.select().single()
  );
}

/**
 * Update existing feedback
 */
export async function updateFeedback(id: number | string, updateData: Partial<CustomerFeedback>) {
  return dbOps.executeQuery(
    Tables.CUSTOMER_FEEDBACK,
    'update',
    updateData,
    query => query.eq('id', id).select().single()
  );
}

/**
 * Delete feedback
 */
export async function deleteFeedback(id: number | string) {
  return dbOps.executeQuery(
    Tables.CUSTOMER_FEEDBACK,
    'delete',
    undefined,
    query => query.eq('id', id)
  );
}

/**
 * Get feedback statistics
 */
export async function getFeedbackStats() {
  const client = db.getSupabaseClient();
  
  try {
    const { data: averageRating, error: avgError } = await client.rpc('get_average_rating');
    
    if (avgError) {
      logger.error('Error fetching average rating', avgError);
      return { data: null, error: avgError };
    }
    
    const { data: ratingCounts, error: countError } = await client.rpc('get_rating_counts');
    
    if (countError) {
      logger.error('Error fetching rating counts', countError);
      return { data: null, error: countError };
    }
    
    return { 
      data: {
        averageRating,
        ratingCounts,
        totalCount: ratingCounts.reduce((sum: number, item: any) => sum + item.count, 0)
      }, 
      error: null 
    };
  } catch (error) {
    logger.error('Unexpected error in getFeedbackStats', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Subscribe to feedback changes
 */
export function subscribeToFeedbackChanges(
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  callback: (payload: any) => void,
  subscriptionId: string = 'default'
) {
  // Unsubscribe if there's an existing subscription with this ID
  if (activeSubscriptions.has(subscriptionId)) {
    db.removeSubscription(activeSubscriptions.get(subscriptionId)!);
  }
  
  // Create new subscription
  const channel = db.createSubscription(
    Tables.CUSTOMER_FEEDBACK, 
    event,
    callback
  );
  
  // Store the subscription
  activeSubscriptions.set(subscriptionId, channel);
  
  return channel;
}

/**
 * Unsubscribe from feedback changes
 */
export async function unsubscribeFromFeedbackChanges(subscriptionId: string = 'default') {
  if (activeSubscriptions.has(subscriptionId)) {
    await db.removeSubscription(activeSubscriptions.get(subscriptionId)!);
    activeSubscriptions.delete(subscriptionId);
    return true;
  }
  return false;
}

export default {
  getFeedbackPaginated,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackStats,
  subscribeToFeedbackChanges,
  unsubscribeFromFeedbackChanges
};