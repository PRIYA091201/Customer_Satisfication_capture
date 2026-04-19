import { Request, Response } from 'express';
import logger from '../utils/logger';
import { CustomerFeedback, PaginationOptions } from '../types/database.types';
import feedbackService from '../services/feedback.service';

export const getFeedback = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const orderBy = (req.query.orderBy as string) || 'created_at';
    const orderDirection = (req.query.orderDirection as 'asc' | 'desc') || 'desc';
    
    const paginationOptions: PaginationOptions = {
      page,
      pageSize,
      orderBy,
      orderDirection
    };
    
    // Use the feedback service
    const { data, error } = await feedbackService.getFeedbackPaginated(paginationOptions);
      
    if (error) {
      logger.error('Error fetching feedback', error);
      return res.status(500).json({ error: 'Failed to fetch feedback' });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Unexpected error in getFeedback', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export const getFeedbackById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    
    const { data, error } = await feedbackService.getFeedbackById(id);
      
    if (error) {
      logger.error(`Error fetching feedback with id ${id}`, error);
      return res.status(500).json({ error: 'Failed to fetch feedback' });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Unexpected error in getFeedbackById', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export const createFeedback = async (req: Request, res: Response) => {
  try {
    const { customer_name, rating, comments } = req.body;
    
    if (!customer_name || rating === undefined) {
      return res.status(400).json({ error: 'Customer name and rating are required' });
    }
    
    const feedbackData: CustomerFeedback = {
      customer_name,
      rating,
      comments: comments || '',
    };
    
    const { data, error } = await feedbackService.createFeedback(feedbackData);
      
    if (error) {
      logger.error('Error creating feedback', error);
      return res.status(500).json({ error: 'Failed to create feedback' });
    }
    
    return res.status(201).json(data);
  } catch (error) {
    logger.error('Unexpected error in createFeedback', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export const updateFeedback = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { customer_name, rating, comments } = req.body;
    
    const updateData: Partial<CustomerFeedback> = {};
    if (customer_name) updateData.customer_name = customer_name;
    if (rating !== undefined) updateData.rating = rating;
    if (comments !== undefined) updateData.comments = comments;
    
    const { data, error } = await feedbackService.updateFeedback(id, updateData);
      
    if (error) {
      logger.error(`Error updating feedback with id ${id}`, error);
      return res.status(500).json({ error: 'Failed to update feedback' });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Unexpected error in updateFeedback', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export const deleteFeedback = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    
    const { error } = await feedbackService.deleteFeedback(id);
      
    if (error) {
      logger.error(`Error deleting feedback with id ${id}`, error);
      return res.status(500).json({ error: 'Failed to delete feedback' });
    }
    
    return res.status(204).end();
  } catch (error) {
    logger.error('Unexpected error in deleteFeedback', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export const getFeedbackStats = async (req: Request, res: Response) => {
  try {
    const { data, error } = await feedbackService.getFeedbackStats();
    
    if (error) {
      logger.error('Error fetching feedback statistics', error);
      return res.status(500).json({ error: 'Failed to fetch feedback statistics' });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    logger.error('Unexpected error in getFeedbackStats', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

export default {
  getFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackStats
};