import { Router } from 'express';
import healthRoutes from './health';
import githubRoutes from './github';
import analysisRoutes from './analysis';
import mainRoutes from './main';

const router = Router();

// Aggregate all routes
router.use('/', healthRoutes);
router.use('/', mainRoutes);
router.use('/github', githubRoutes);
router.use('/analysis', analysisRoutes);

export default router;
