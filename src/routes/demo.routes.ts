import { Router } from 'express';
import demoController from '../controllers/demo.controller';
import dbMiddleware from '../middleware/database.middleware';

const router = Router();

// Apply database middleware to all demo routes
router.use(dbMiddleware.validateSupabaseConfig);

/**
 * @route   GET /api/demo
 * @desc    List all available demo endpoints
 * @access  Public
 */
router.get('/', demoController.listEndpoints);

/**
 * @route   GET /api/demo/simple
 * @desc    Simple query demo
 * @access  Public
 */
router.get('/simple', dbMiddleware.checkDatabaseConnection, demoController.simpleQuery);

/**
 * @route   GET /api/demo/filtered
 * @desc    Filtered query demo
 * @access  Public
 */
router.get('/filtered', dbMiddleware.checkDatabaseConnection, demoController.filteredQuery);

/**
 * @route   POST /api/demo/create
 * @desc    Create record demo
 * @access  Public
 */
router.post('/create', dbMiddleware.checkDatabaseConnection, demoController.createRecord);

/**
 * @route   POST /api/demo/batch
 * @desc    Batch operation demo
 * @access  Public
 */
router.post('/batch', dbMiddleware.checkDatabaseConnection, demoController.batchDemo);

/**
 * @route   GET /api/demo/aggregation
 * @desc    Aggregation query demo
 * @access  Public
 */
router.get('/aggregation', dbMiddleware.checkDatabaseConnection, demoController.aggregationDemo);

/**
 * @route   POST /api/demo/transaction
 * @desc    Transaction demo
 * @access  Public
 */
router.post('/transaction', dbMiddleware.checkDatabaseConnection, demoController.transactionDemo);

export default router;