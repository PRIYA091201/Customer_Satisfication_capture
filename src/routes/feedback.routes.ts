import { Router } from 'express';
import feedbackController from '../controllers/feedback.controller';
import dbMiddleware from '../middleware/database.middleware';

const router = Router();

// Apply database middleware to all feedback routes
router.use(dbMiddleware.validateSupabaseConfig);

/**
 * @route   GET /api/feedback
 * @desc    Get all feedback
 * @access  Public
 */
router.get('/', dbMiddleware.checkDatabaseConnection, feedbackController.getFeedback);

/**
 * @route   GET /api/feedback/stats
 * @desc    Get feedback statistics
 * @access  Public
 */
router.get('/stats', dbMiddleware.checkDatabaseConnection, feedbackController.getFeedbackStats);

/**
 * @route   GET /api/feedback/:id
 * @desc    Get feedback by ID
 * @access  Public
 */
router.get('/:id', feedbackController.getFeedbackById);

/**
 * @route   POST /api/feedback
 * @desc    Create new feedback
 * @access  Public
 */
router.post('/', feedbackController.createFeedback);

/**
 * @route   PUT /api/feedback/:id
 * @desc    Update feedback
 * @access  Public
 */
router.put('/:id', feedbackController.updateFeedback);

/**
 * @route   DELETE /api/feedback/:id
 * @desc    Delete feedback
 * @access  Public
 */
router.delete('/:id', feedbackController.deleteFeedback);

export default router;