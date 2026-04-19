import { Router } from 'express';
import * as apiController from '../controllers/api.controller';
import feedbackRoutes from './feedback.routes';
import demoRoutes from './demo.routes';

const router = Router();

router.get('/', apiController.getApiInfo);
router.get('/status', apiController.getStatus);

// Mount feedback routes
router.use('/feedback', feedbackRoutes);

// Mount demo routes
router.use('/demo', demoRoutes);

export default router;