import { Request, Response, NextFunction } from 'express';
import db from '../utils/db';
import logger from '../utils/logger';

/**
 * Middleware to check database connection before processing requests
 */
export const checkDatabaseConnection = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const isConnected = await db.checkDbConnection();
    
    if (!isConnected) {
      logger.error('Database connection unavailable');
      return res.status(503).json({ 
        error: 'Database service unavailable', 
        message: 'Unable to connect to the database. Please try again later.'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Error checking database connection', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: 'An error occurred while connecting to the database' 
    });
  }
};

/**
 * Middleware to ensure required Supabase credentials are configured
 */
export const validateSupabaseConfig = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const supabase = db.getSupabaseClient();
    
    if (!supabase) {
      logger.error('Supabase client not initialized');
      return res.status(500).json({ 
        error: 'Database configuration error', 
        message: 'Supabase client could not be initialized. Check your configuration.'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Error validating Supabase configuration', error);
    return res.status(500).json({ 
      error: 'Database configuration error', 
      message: 'Invalid Supabase configuration'
    });
  }
};

export default {
  checkDatabaseConnection,
  validateSupabaseConfig
};