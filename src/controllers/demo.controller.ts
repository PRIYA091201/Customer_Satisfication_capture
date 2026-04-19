import { Request, Response } from 'express';
import db from '../utils/db';
import dbOps from '../utils/db-operations';
import logger from '../utils/logger';
import { Tables } from '../types/database.types';
import feedbackService from '../services/feedback.service';

/**
 * Demo endpoint to show simple query
 */
export const simpleQuery = async (req: Request, res: Response) => {
  try {
    // Get Supabase client and run a simple query
    const client = db.getSupabaseClient();
    
    const { data, error } = await client
      .from('customer_feedback')
      .select('*')
      .limit(5);
    
    if (error) {
      logger.error('Error executing simple query', error);
      return res.status(500).json({ 
        success: false,
        error: error.message,
        endpoint: 'simpleQuery'
      });
    }
    
    return res.status(200).json({
      success: true,
      data,
      message: 'Simple query executed successfully',
      endpoint: 'simpleQuery'
    });
  } catch (error) {
    logger.error('Unexpected error in demo simpleQuery', error);
    return res.status(500).json({ 
      success: false, 
      error: 'An unexpected error occurred',
      endpoint: 'simpleQuery'
    });
  }
};

/**
 * Demo endpoint to show filtered query
 */
export const filteredQuery = async (req: Request, res: Response) => {
  try {
    const { minRating } = req.query;
    
    // Parse the rating parameter
    const rating = parseInt(minRating as string) || 3;
    
    // Get Supabase client and run a filtered query
    const client = db.getSupabaseClient();
    
    const { data, error } = await client
      .from('customer_feedback')
      .select('*')
      .gte('rating', rating)
      .order('rating', { ascending: false });
    
    if (error) {
      logger.error('Error executing filtered query', error);
      return res.status(500).json({ 
        success: false,
        error: error.message,
        endpoint: 'filteredQuery'
      });
    }
    
    return res.status(200).json({
      success: true,
      data,
      message: `Filtered query for ratings >= ${rating} executed successfully`,
      filter: { minRating: rating },
      endpoint: 'filteredQuery'
    });
  } catch (error) {
    logger.error('Unexpected error in demo filteredQuery', error);
    return res.status(500).json({ 
      success: false, 
      error: 'An unexpected error occurred',
      endpoint: 'filteredQuery'
    });
  }
};

/**
 * Demo endpoint to show create operation
 */
export const createRecord = async (req: Request, res: Response) => {
  try {
    const newFeedback = {
      customer_name: req.body.name || 'Demo User',
      rating: req.body.rating || 5,
      comments: req.body.comments || 'This is a demo feedback',
      source: 'api_demo'
    };
    
    const { data, error } = await feedbackService.createFeedback(newFeedback);
    
    if (error) {
      logger.error('Error creating demo record', error);
      return res.status(500).json({ 
        success: false,
        error: error.message,
        endpoint: 'createRecord'
      });
    }
    
    return res.status(201).json({
      success: true,
      data,
      message: 'Record created successfully',
      endpoint: 'createRecord'
    });
  } catch (error) {
    logger.error('Unexpected error in demo createRecord', error);
    return res.status(500).json({ 
      success: false, 
      error: 'An unexpected error occurred',
      endpoint: 'createRecord'
    });
  }
};

/**
 * Demo endpoint for batch operations
 */
export const batchDemo = async (req: Request, res: Response) => {
  try {
    // Generate some sample data
    const sampleRecords = Array.from({ length: 5 }).map((_, index) => ({
      customer_name: `Batch User ${index + 1}`,
      rating: Math.floor(Math.random() * 5) + 1,
      comments: `Batch generated feedback ${index + 1}`,
      source: 'batch_demo'
    }));
    
    // Perform a batch insert
    const result = await dbOps.batchInsert(
      Tables.CUSTOMER_FEEDBACK,
      sampleRecords
    );
    
    return res.status(200).json({
      success: true,
      inserted: result.success,
      errors: result.errors.length,
      message: 'Batch operation executed successfully',
      endpoint: 'batchDemo'
    });
  } catch (error) {
    logger.error('Unexpected error in demo batchDemo', error);
    return res.status(500).json({ 
      success: false, 
      error: 'An unexpected error occurred',
      endpoint: 'batchDemo'
    });
  }
};

/**
 * Demo endpoint for aggregation query
 */
export const aggregationDemo = async (req: Request, res: Response) => {
  try {
    // Get Supabase client and run an aggregation query
    const client = db.getSupabaseClient();
    
    const { data: avgResult, error: avgError } = await client
      .from('customer_feedback')
      .select('rating')
      .execute();
    
    if (avgError) {
      logger.error('Error executing aggregation query', avgError);
      return res.status(500).json({ 
        success: false,
        error: avgError.message,
        endpoint: 'aggregationDemo'
      });
    }
    
    // Calculate average rating manually since we're using the select method
    const ratings = avgResult.map(item => item.rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;
    
    // Get counts by rating
    const ratingCounts = {};
    ratings.forEach(rating => {
      ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
    });
    
    return res.status(200).json({
      success: true,
      data: {
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalCount: ratings.length,
        ratingCounts
      },
      message: 'Aggregation query executed successfully',
      endpoint: 'aggregationDemo'
    });
  } catch (error) {
    logger.error('Unexpected error in demo aggregationDemo', error);
    return res.status(500).json({ 
      success: false, 
      error: 'An unexpected error occurred',
      endpoint: 'aggregationDemo'
    });
  }
};

/**
 * Demo endpoint for transaction (simulated with batch)
 */
export const transactionDemo = async (req: Request, res: Response) => {
  try {
    const client = db.getSupabaseClient();
    
    // Delete any old demo transactions first
    await client
      .from('customer_feedback')
      .delete()
      .eq('source', 'transaction_demo');
    
    // Insert two new records (simulating a transaction)
    const { data, error } = await client
      .from('customer_feedback')
      .insert([
        {
          customer_name: 'Transaction User 1',
          rating: 5,
          comments: 'First record in transaction',
          source: 'transaction_demo'
        },
        {
          customer_name: 'Transaction User 2',
          rating: 4,
          comments: 'Second record in transaction',
          source: 'transaction_demo'
        }
      ])
      .select();
    
    if (error) {
      logger.error('Error executing transaction demo', error);
      return res.status(500).json({ 
        success: false,
        error: error.message,
        endpoint: 'transactionDemo'
      });
    }
    
    return res.status(200).json({
      success: true,
      data,
      message: 'Transaction demo executed successfully',
      endpoint: 'transactionDemo'
    });
  } catch (error) {
    logger.error('Unexpected error in demo transactionDemo', error);
    return res.status(500).json({ 
      success: false, 
      error: 'An unexpected error occurred',
      endpoint: 'transactionDemo'
    });
  }
};

/**
 * List all demo endpoints
 */
export const listEndpoints = async (req: Request, res: Response) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/api/demo`;
  
  const endpoints = [
    {
      name: 'Simple Query',
      endpoint: `${baseUrl}/simple`,
      method: 'GET',
      description: 'Demonstrates a simple SELECT query'
    },
    {
      name: 'Filtered Query',
      endpoint: `${baseUrl}/filtered?minRating=4`,
      method: 'GET',
      description: 'Demonstrates filtering records by rating'
    },
    {
      name: 'Create Record',
      endpoint: `${baseUrl}/create`,
      method: 'POST',
      body: {
        name: 'Demo User',
        rating: 5,
        comments: 'Great experience!'
      },
      description: 'Demonstrates inserting a new record'
    },
    {
      name: 'Batch Operation',
      endpoint: `${baseUrl}/batch`,
      method: 'POST',
      description: 'Demonstrates inserting multiple records in a batch'
    },
    {
      name: 'Aggregation',
      endpoint: `${baseUrl}/aggregation`,
      method: 'GET',
      description: 'Demonstrates aggregating data (average rating)'
    },
    {
      name: 'Transaction',
      endpoint: `${baseUrl}/transaction`,
      method: 'POST',
      description: 'Demonstrates a simple transaction (multiple operations)'
    }
  ];
  
  return res.status(200).json({
    success: true,
    endpoints,
    message: 'Available demo endpoints',
    note: 'Try these endpoints to see Supabase PostgreSQL in action'
  });
};

export default {
  simpleQuery,
  filteredQuery,
  createRecord,
  batchDemo,
  aggregationDemo,
  transactionDemo,
  listEndpoints
};